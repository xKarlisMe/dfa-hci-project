import sys,json,time
from pathlib import Path
sys.path.insert(0,str(Path('.qa').resolve()))
from browser import Browser
b=Browser();b.call('Emulation.setScrollbarsHidden',{'hidden':True});root=Path('.').resolve();report={'screens':34,'viewports':[1440,1280,768,390,320],'overflow':[],'screenshots':[],'fonts':{},'keyboard':[]}
files=sorted(Path('pages').rglob('*.html'))
for width in report['viewports']:
 for p in files:
  b.open(p.as_posix(),width,1080);size=b.call('Page.getLayoutMetrics')['cssContentSize']
  if size['width']>width:report['overflow'].append({'file':str(p),'viewport':width,'width':size['width']})
  if width==1440:
   out='.qa/'+p.stem+'-final.png';b.shot(out);report['screenshots'].append(out)
  elif p.name in ['index.html','book-appointment.html','payment-wallet.html','applicant-family.html'] and width in [768,1280,390]:b.shot('.qa/'+p.stem+'-'+str(width)+'-final.png')
for file,selector in [('pages/homepage/index.html','.home-title h1'),('pages/homepage/book-appointment.html','h1')]:
 b.open(file);n=b.nodes(selector)[0];report['fonts'][file]=b.call('CSS.getPlatformFontsForNode',{'nodeId':n})['fonts']
def key(name,code,text=None):
 d={'type':'keyDown','key':name,'windowsVirtualKeyCode':code,'nativeVirtualKeyCode':code}
 if text:d['text']=text
 b.call('Input.dispatchKeyEvent',d);b.call('Input.dispatchKeyEvent',{'type':'keyUp','key':name,'windowsVirtualKeyCode':code,'nativeVirtualKeyCode':code})
b.open('pages/homepage/book-appointment.html');b.call('DOM.focus',{'nodeId':b.nodes('#terms')[0]});key(' ',32,' ');time.sleep(.1)
ax=b.call('Accessibility.getFullAXTree')['nodes'];props=[n for n in ax if n.get('role',{}).get('value')=='checkbox'];report['keyboard'].append({'terms_checkbox_after_space':[n.get('properties') for n in props]});b.shot('.qa/focus-checkbox.png')
b.open('pages/individual/appointment-schedule.html');b.call('DOM.focus',{'nodeId':b.nodes('.calendar-picker summary')[0]});key('Enter',13,'\r');time.sleep(.1);report['keyboard'].append({'calendar_open_after_enter':b.call('DOM.describeNode',{'nodeId':b.nodes('.calendar-picker')[0]})['node'].get('attributes')});b.shot('.qa/calendar-open.png')
b.open('pages/individual/review-payment.html');b.call('DOM.focus',{'nodeId':b.nodes('.edit')[2]});key('Enter',13,'\r');time.sleep(.2);report['keyboard'].append({'family_edit_destination':b.call('Page.getFrameTree')['frameTree']['frame']['url']})
Path('.qa/report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k!='screenshots'},indent=2))
