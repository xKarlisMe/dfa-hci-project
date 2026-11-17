import socket,json,base64,os,struct,urllib.request,time
from pathlib import Path
class Browser:
 def __init__(self):
  targets=json.load(urllib.request.urlopen('http://localhost:9237/json'));u=next(t['webSocketDebuggerUrl'] for t in targets if t['type']=='page');host,path=u[5:].split('/',1);hostname,port=host.split(':');self.s=socket.create_connection((hostname,int(port)));self.s.sendall(('GET /'+path+' HTTP/1.1\r\nHost: '+host+'\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: '+base64.b64encode(os.urandom(16)).decode()+'\r\nSec-WebSocket-Version: 13\r\n\r\n').encode());response=b''
  while b'\r\n\r\n' not in response:response+=self.s.recv(1)
  self.id=0;self.call('Page.enable');self.call('DOM.enable');self.call('CSS.enable')
 def read(self,n):
  b=b''
  while len(b)<n:b+=self.s.recv(n-len(b))
  return b
 def call(self,method,params={}):
  self.id+=1;data=json.dumps({'id':self.id,'method':method,'params':params}).encode();mask=os.urandom(4);length=len(data);head=bytes([129,128|length]) if length<126 else bytes([129,254])+struct.pack('!H',length) if length<65536 else bytes([129,255])+struct.pack('!Q',length);self.s.sendall(head+mask+bytes(v^mask[i%4] for i,v in enumerate(data)))
  while True:
   a,b=self.read(2);n=b&127
   if n==126:n=struct.unpack('!H',self.read(2))[0]
   elif n==127:n=struct.unpack('!Q',self.read(8))[0]
   result=json.loads(self.read(n))
   if result.get('id')==self.id:
    if 'error' in result:raise RuntimeError(result['error'])
    return result.get('result',{})
 def open(self,file,w=1440,h=1080):
  self.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False});self.call('Page.navigate',{'url':Path(file).resolve().as_uri()});time.sleep(.25);self.doc=self.call('DOM.getDocument',{'depth':-1,'pierce':True})['root']['nodeId']
 def nodes(self,selector):return self.call('DOM.querySelectorAll',{'nodeId':self.doc,'selector':selector})['nodeIds']
 def box(self,node):
  try:return self.call('DOM.getBoxModel',{'nodeId':node})['model']['border']
  except:return None
 def shot(self,path):
  size=self.call('Page.getLayoutMetrics')['cssContentSize'];size['height']=min(size['height'],5000);image=self.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True,'clip':dict(size,scale=1)});open(path,'wb').write(base64.b64decode(image['data']))
if __name__=='__main__':
 b=Browser();b.open('index.html',390,1200)
 for selector in ['body','.home-main','.home-title','.services','.service','.important','.contacts','.home-footer','.agency','.agency>div:last-child']:
  print(selector,[b.box(n) for n in b.nodes(selector)])
 n=b.nodes('.home-title h1')[0];print('font',b.call('CSS.getPlatformFontsForNode',{'nodeId':n}))
 print('size',b.call('Page.getLayoutMetrics')['cssContentSize'])
