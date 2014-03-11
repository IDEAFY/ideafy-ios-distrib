(function(){var a="3.1.0";var b,c;(function(){var f={},g=[],d={},e=".";function h(j){var i=j.factory,k=function(m){var l=m;if(m.charAt(0)==="."){l=j.id.slice(0,j.id.lastIndexOf(e))+e+m.slice(2)}return b(l)};j.exports={};delete j.factory;i(k,j.exports,j);return j.exports}b=function(j){if(!f[j]){throw"module "+j+" not found"}else{if(j in d){var i=g.slice(d[j]).join("->")+"->"+j;throw"Cycle in require graph: "+i}}if(f[j].factory){try{d[j]=g.length;g.push(j);return h(f[j])}finally{delete d[j];g.pop()}}return f[j].exports};c=function(j,i){if(f[j]){throw"module "+j+" already defined"}f[j]={id:j,factory:i}};c.remove=function(i){delete f[i]};c.moduleMap=f})();if(typeof module==="object"&&typeof b==="function"){module.exports.require=b;module.exports.define=c}c("cordova",function(h,j,f){var l=h("cordova/channel");var g=h("cordova/platform");var i=document.addEventListener;var p=document.removeEventListener;var n=window.addEventListener;var k=window.removeEventListener;var e={},d={};document.addEventListener=function(q,s,r){var t=q.toLowerCase();if(typeof e[t]!="undefined"){e[t].subscribe(s)}else{i.call(document,q,s,r)}};window.addEventListener=function(q,s,r){var t=q.toLowerCase();if(typeof d[t]!="undefined"){d[t].subscribe(s)}else{n.call(window,q,s,r)}};document.removeEventListener=function(q,s,r){var t=q.toLowerCase();if(typeof e[t]!="undefined"){e[t].unsubscribe(s)}else{p.call(document,q,s,r)}};window.removeEventListener=function(q,s,r){var t=q.toLowerCase();if(typeof d[t]!="undefined"){d[t].unsubscribe(s)}else{k.call(window,q,s,r)}};function o(r,t){var s=document.createEvent("Events");s.initEvent(r,false,false);if(t){for(var q in t){if(t.hasOwnProperty(q)){s[q]=t[q]}}}return s}var m={define:c,require:h,version:a,platformId:g.id,addWindowEventHandler:function(q){return(d[q]=l.create(q))},addStickyDocumentEventHandler:function(q){return(e[q]=l.createSticky(q))},addDocumentEventHandler:function(q){return(e[q]=l.create(q))},removeWindowEventHandler:function(q){delete d[q]},removeDocumentEventHandler:function(q){delete e[q]},getOriginalHandlers:function(){return{document:{addEventListener:i,removeEventListener:p},window:{addEventListener:n,removeEventListener:k}}},fireDocumentEvent:function(s,t,r){var q=o(s,t);if(typeof e[s]!="undefined"){if(r){e[s].fire(q)}else{setTimeout(function(){if(s=="deviceready"){document.dispatchEvent(q)}e[s].fire(q)},0)}}else{document.dispatchEvent(q)}},fireWindowEvent:function(r,s){var q=o(r,s);if(typeof d[r]!="undefined"){setTimeout(function(){d[r].fire(q)},0)}else{window.dispatchEvent(q)}},callbackId:Math.floor(Math.random()*2000000000),callbacks:{},callbackStatus:{NO_RESULT:0,OK:1,CLASS_NOT_FOUND_EXCEPTION:2,ILLEGAL_ACCESS_EXCEPTION:3,INSTANTIATION_EXCEPTION:4,MALFORMED_URL_EXCEPTION:5,IO_EXCEPTION:6,INVALID_ACTION:7,JSON_EXCEPTION:8,ERROR:9},callbackSuccess:function(r,q){try{m.callbackFromNative(r,true,q.status,[q.message],q.keepCallback)}catch(s){console.log("Error in error callback: "+r+" = "+s)}},callbackError:function(r,q){try{m.callbackFromNative(r,false,q.status,[q.message],q.keepCallback)}catch(s){console.log("Error in error callback: "+r+" = "+s)}},callbackFromNative:function(t,u,q,s,r){var v=m.callbacks[t];if(v){if(u&&q==m.callbackStatus.OK){v.success&&v.success.apply(null,s)}else{if(!u){v.fail&&v.fail.apply(null,s)}}if(!r){delete m.callbacks[t]}}},addConstructor:function(q){l.onCordovaReady.subscribe(function(){try{q()}catch(r){console.log("Failed to run constructor: "+r)}})}};f.exports=m});c("cordova/argscheck",function(h,k,f){var i=h("cordova/exec");var l=h("cordova/utils");var m=f.exports;var e={A:"Array",D:"Date",N:"Number",S:"String",F:"Function",O:"Object"};function g(n,o){return(/.*?\((.*?)\)/).exec(n)[1].split(", ")[o]}function d(v,r,s,p){if(!m.enableChecks){return}var q=null;var u;for(var o=0;o<v.length;++o){var t=v.charAt(o),n=t.toUpperCase(),w=s[o];if(t=="*"){continue}u=l.typeName(w);if((w===null||w===undefined)&&t==n){continue}if(u!=e[n]){q="Expected "+e[n];break}}if(q){q+=", but got "+u+".";q='Wrong type for parameter "'+g(p||s.callee,o)+'" of '+r+": "+q;if(typeof jasmine=="undefined"){console.error(q)}throw TypeError(q)}}function j(o,n){return o===undefined?n:o}m.checkArgs=d;m.getValue=j;m.enableChecks=true});c("cordova/base64",function(g,f,h){var e=f;e.fromArrayBuffer=function(l){var m=new Uint8Array(l);return j(m)};var i="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var k;var d=function(){k=[];for(var m=0;m<64;m++){for(var l=0;l<64;l++){k[m*64+l]=i[m]+i[l]}}d=function(){return k};return k};function j(q){var m=q.byteLength;var l="";var p;var o=d();for(var n=0;n<m-2;n+=3){p=(q[n]<<16)+(q[n+1]<<8)+q[n+2];l+=o[p>>12];l+=o[p&4095]}if(m-n==2){p=(q[n]<<16)+(q[n+1]<<8);l+=o[p>>12];l+=i[(p&4095)>>6];l+="="}else{if(m-n==1){p=(q[n]<<16);l+=o[p>>12];l+="=="}}return l}});c("cordova/builder",function(h,i,g){var k=h("cordova/utils");function j(o,n,m){for(var p in o){if(o.hasOwnProperty(p)){n.apply(m,[o[p],p])}}}function l(o,m,n){i.replaceHookForTesting(o,m);o[m]=n;if(o[m]!==n){k.defineGetter(o,m,function(){return n})}}function d(p,m,o,n){if(n){k.defineGetter(p,m,function(){console.log(n);delete p[m];l(p,m,o);return o})}else{l(p,m,o)}}function e(m,n,p,o){j(n,function(t,r){try{var q=t.path?h(t.path):{};if(p){if(typeof m[r]==="undefined"){d(m,r,q,t.deprecated)}else{if(typeof t.path!=="undefined"){if(o){f(m[r],q)}else{d(m,r,q,t.deprecated)}}}q=m[r]}else{if(typeof m[r]=="undefined"){d(m,r,q,t.deprecated)}else{q=m[r]}}if(t.children){e(q,t.children,p,o)}}catch(s){k.alert("Exception building cordova JS globals: "+s+' for key "'+r+'"')}})}function f(m,n){for(var o in n){if(n.hasOwnProperty(o)){if(m.prototype&&m.prototype.constructor===m){l(m.prototype,o,n[o])}else{if(typeof n[o]==="object"&&typeof m[o]==="object"){f(m[o],n[o])}else{l(m,o,n[o])}}}}}i.buildIntoButDoNotClobber=function(m,n){e(n,m,false,false)};i.buildIntoAndClobber=function(m,n){e(n,m,true,false)};i.buildIntoAndMerge=function(m,n){e(n,m,true,true)};i.recursiveMerge=f;i.assignOrWrapInDeprecateGetter=d;i.replaceHookForTesting=function(){}});c("cordova/channel",function(f,e,h){var d=f("cordova/utils"),k=1;var g=function(l,m){this.type=l;this.handlers={};this.state=m?1:0;this.fireArgs=null;this.numHandlers=0;this.onHasSubscribersChange=null},j={join:function(o,q){var l=q.length,n=l,p=function(){if(!(--n)){o()}};for(var m=0;m<l;m++){if(q[m].state===0){throw Error("Can only use join with sticky channels.")}q[m].subscribe(p)}if(!l){o()}},create:function(l){return j[l]=new g(l,false)},createSticky:function(l){return j[l]=new g(l,true)},deviceReadyChannelsArray:[],deviceReadyChannelsMap:{},waitForInitialization:function(l){if(l){var m=j[l]||this.createSticky(l);this.deviceReadyChannelsMap[l]=m;this.deviceReadyChannelsArray.push(m)}},initializationComplete:function(l){var m=this.deviceReadyChannelsMap[l];if(m){m.fire()}}};function i(l){if(typeof l!="function"){throw"Function required as first argument!"}}g.prototype.subscribe=function(n,o){i(n);if(this.state==2){n.apply(o||this,this.fireArgs);return}var m=n,l=n.observer_guid;if(typeof o=="object"){m=d.close(o,n)}if(!l){l=""+k++}m.observer_guid=l;n.observer_guid=l;if(!this.handlers[l]){this.handlers[l]=m;this.numHandlers++;if(this.numHandlers==1){this.onHasSubscribersChange&&this.onHasSubscribersChange()}}};g.prototype.unsubscribe=function(n){i(n);var l=n.observer_guid,m=this.handlers[l];if(m){delete this.handlers[l];this.numHandlers--;if(this.numHandlers===0){this.onHasSubscribersChange&&this.onHasSubscribersChange()}}};g.prototype.fire=function(q){var l=false,o=Array.prototype.slice.call(arguments);if(this.state==1){this.state=2;this.fireArgs=o}if(this.numHandlers){var n=[];for(var p in this.handlers){n.push(this.handlers[p])}for(var m=0;m<n.length;++m){n[m].apply(this,o)}if(this.state==2&&this.numHandlers){this.numHandlers=0;this.handlers={};this.onHasSubscribersChange&&this.onHasSubscribersChange()}}};j.createSticky("onDOMContentLoaded");j.createSticky("onNativeReady");j.createSticky("onCordovaReady");j.createSticky("onPluginsReady");j.createSticky("onDeviceReady");j.create("onResume");j.create("onPause");j.createSticky("onDestroy");j.waitForInitialization("onCordovaReady");j.waitForInitialization("onDOMContentLoaded");h.exports=j});c("cordova/exec",function(k,v,g){var n=k("cordova"),x=k("cordova/channel"),r=k("cordova/utils"),f=k("cordova/base64"),p={IFRAME_NAV:0,XHR_NO_PAYLOAD:1,XHR_WITH_PAYLOAD:2,XHR_OPTIONAL_PAYLOAD:3},e,s,u,q=0,m=null,j=[],o=0;function t(){var y=document.createElement("iframe");y.style.display="none";document.body.appendChild(y);return y}function i(){if(e==p.XHR_WITH_PAYLOAD){return true}if(e==p.XHR_OPTIONAL_PAYLOAD){var z=0;for(var y=0;y<j.length;++y){z+=j[y].length}return z<4500}return false}function h(z){if(!z||r.typeName(z)!="Array"){return z}var y=[];z.forEach(function(A,B){if(r.typeName(A)=="ArrayBuffer"){y.push({CDVType:"ArrayBuffer",data:f.fromArrayBuffer(A)})}else{y.push(A)}});return y}function w(z){if(z.CDVType=="ArrayBuffer"){var A=function(D){var B=new Uint8Array(D.length);for(var C=0;C<D.length;C++){B[C]=D.charCodeAt(C)}return B.buffer};var y=function(B){return A(atob(B))};z=y(z.data)}return z}function d(z){var y=[];if(!z||!z.hasOwnProperty("CDVType")){y.push(z)}else{if(z.CDVType=="MultiPart"){z.messages.forEach(function(A){y.push(w(A))})}else{y.push(w(z))}}return y}function l(){if(e===undefined){e=navigator.userAgent.indexOf(" 4_")==-1?p.XHR_NO_PAYLOAD:p.IFRAME_NAV}var z,E,F,C,A,D;var y=null;if(typeof arguments[0]!=="string"){z=arguments[0];E=arguments[1];F=arguments[2];C=arguments[3];A=arguments[4];y="INVALID"}else{try{D=arguments[0].split(".");C=D.pop();F=D.join(".");A=Array.prototype.splice.call(arguments,1);console.log('The old format of this exec call has been removed (deprecated since 2.1). Change to: cordova.exec(null, null, "'+F+'", "'+C+'",'+JSON.stringify(A)+");");return}catch(G){}}if(z||E){y=F+n.callbackId++;n.callbacks[y]={success:z,fail:E}}A=h(A);var B=[y,F,C,A];j.push(JSON.stringify(B));if(!o&&j.length==1){if(e!=p.IFRAME_NAV){if(u&&u.readyState!=4){u=null}u=u||new XMLHttpRequest();u.open("HEAD","/!gap_exec?"+(+new Date()),true);if(!m){m=/.*\((.*)\)/.exec(navigator.userAgent)[1]}u.setRequestHeader("vc",m);u.setRequestHeader("rc",++q);if(i()){u.setRequestHeader("cmds",l.nativeFetchMessages())}u.send(null)}else{s=s||t();s.src="gap://ready"}}}l.jsToNativeModes=p;l.setJsToNativeBridgeMode=function(y){if(s){s.parentNode.removeChild(s);s=null}e=y};l.nativeFetchMessages=function(){if(!j.length){return""}var y="["+j.join(",")+"]";j.length=0;return y};l.nativeCallback=function(B,y,A,z){return l.nativeEvalAndFetch(function(){var D=y===0||y===1;var C=d(A);n.callbackFromNative(B,D,y,C,z)})};l.nativeEvalAndFetch=function(y){o++;try{y();return l.nativeFetchMessages()}finally{o--}};g.exports=l});c("cordova/init",function(g,i,d){var k=g("cordova/channel");var l=g("cordova");var j=g("cordova/modulemapper");var e=g("cordova/platform");var f=g("cordova/pluginloader");var n=[k.onNativeReady,k.onPluginsReady];function h(o){for(var p=0;p<o.length;++p){if(o[p].state!=2){console.log("Channel not fired: "+o[p].type)}}}window.setTimeout(function(){if(k.onDeviceReady.state!=2){console.log("deviceready has not fired after 5 seconds.");h(n);h(k.deviceReadyChannelsArray)}},5000);function m(o){var q=function(){};q.prototype=o;var r=new q();if(q.bind){for(var p in o){if(typeof o[p]=="function"){r[p]=o[p].bind(o)}}}return r}if(window.navigator){window.navigator=m(window.navigator)}if(!window.console){window.console={log:function(){}}}if(!window.console.warn){window.console.warn=function(o){this.log("warn: "+o)}}k.onPause=l.addDocumentEventHandler("pause");k.onResume=l.addDocumentEventHandler("resume");k.onDeviceReady=l.addStickyDocumentEventHandler("deviceready");if(document.readyState=="complete"||document.readyState=="interactive"){k.onDOMContentLoaded.fire()}else{document.addEventListener("DOMContentLoaded",function(){k.onDOMContentLoaded.fire()},false)}if(window._nativeReady){k.onNativeReady.fire()}j.clobbers("cordova","cordova");j.clobbers("cordova/exec","cordova.exec");j.clobbers("cordova/exec","Cordova.exec");e.bootstrap&&e.bootstrap();f.load(function(){k.onPluginsReady.fire()});k.join(function(){j.mapModules(window);e.initialize&&e.initialize();k.onCordovaReady.fire();k.join(function(){g("cordova").fireDocumentEvent("deviceready")},k.deviceReadyChannelsArray)},n)});c("cordova/modulemapper",function(f,g,e){var h=f("cordova/builder"),i=c.moduleMap,k,l;g.reset=function(){k=[];l={}};function d(p,n,m,o){if(!(n in i)){throw new Error("Module "+n+" does not exist.")}k.push(p,n,m);if(o){l[m]=o}}g.clobbers=function(n,m,o){d("c",n,m,o)};g.merges=function(n,m,o){d("m",n,m,o)};g.defaults=function(n,m,o){d("d",n,m,o)};g.runs=function(m){d("r",m,null)};function j(m,p){if(!m){return p}var q=m.split(".");var r=p;for(var o=0,n;n=q[o];++o){r=r[n]=r[n]||{}}return r}g.mapModules=function(p){var s={};p.CDV_origSymbols=s;for(var w=0,x=k.length;w<x;w+=3){var u=k[w];var o=k[w+1];var q=f(o);if(u=="r"){continue}var t=k[w+2];var n=t.lastIndexOf(".");var r=t.substr(0,n);var z=t.substr(n+1);var m=t in l?"Access made to deprecated symbol: "+t+". "+m:null;var v=j(r,p);var y=v[z];if(u=="m"&&y){h.recursiveMerge(y,q)}else{if((u=="d"&&!y)||(u!="d")){if(!(t in s)){s[t]=y}h.assignOrWrapInDeprecateGetter(v,z,q,m)}}}};g.getOriginalSymbol=function(o,m){var r=o.CDV_origSymbols;if(r&&(m in r)){return r[m]}var q=m.split(".");var p=o;for(var n=0;n<q.length;++n){p=p&&p[q[n]]}return p};g.reset()});c("cordova/platform",function(e,d,f){f.exports={id:"ios",bootstrap:function(){e("cordova/channel").onNativeReady.fire()}}});c("cordova/pluginloader",function(g,i,e){var k=g("cordova/modulemapper");function h(o,p,m){var n=document.createElement("script");n.onload=p;n.onerror=m||p;n.src=o;document.head.appendChild(n)}function f(s,q){for(var p=0,o;o=s[p];p++){if(o){try{if(o.clobbers&&o.clobbers.length){for(var n=0;n<o.clobbers.length;n++){k.clobbers(o.id,o.clobbers[n])}}if(o.merges&&o.merges.length){for(var m=0;m<o.merges.length;m++){k.merges(o.id,o.merges[m])}}if(o.runs&&!(o.clobbers&&o.clobbers.length)&&!(o.merges&&o.merges.length)){k.runs(o.id)}}catch(r){}}}q()}function j(r,q,o){var p=q.length;if(!p){o();return}function m(){if(!--p){f(q,o)}}for(var n=0;n<q.length;n++){h(r+q[n].file,m)}}function l(n,m){h(n+"cordova_plugins.js",function(){try{var o=g("cordova/plugin_list");j(n,o,m)}catch(p){m()}},m)}function d(){var p=null;var m=document.getElementsByTagName("script");var o="cordova.js";for(var r=m.length-1;r>-1;r--){var q=m[r].src;if(q.indexOf(o)==(q.length-o.length)){p=q.substring(0,q.length-o.length);break}}return p}i.load=function(n){var m=d();if(m===null){console.log("Could not find cordova.js script tag. Plugin loading may fail.");m=""}l(m,n)}});c("cordova/urlutil",function(e,d,f){var h=d;var g=document.createElement("a");h.makeAbsolute=function(i){g.href=i;return g.href}});c("cordova/utils",function(f,e,g){var d=e;d.defineGetterSetter=function(k,i,m,j){if(Object.defineProperty){var l={get:m,configurable:true};if(j){l.set=j}Object.defineProperty(k,i,l)}else{k.__defineGetter__(i,m);if(j){k.__defineSetter__(i,j)}}};d.defineGetter=d.defineGetterSetter;d.arrayIndexOf=function(k,m){if(k.indexOf){return k.indexOf(m)}var j=k.length;for(var l=0;l<j;++l){if(k[l]==m){return l}}return -1};d.arrayRemove=function(i,k){var j=d.arrayIndexOf(i,k);if(j!=-1){i.splice(j,1)}return j!=-1};d.typeName=function(i){return Object.prototype.toString.call(i).slice(8,-1)};d.isArray=function(i){return d.typeName(i)=="Array"};d.isDate=function(i){return d.typeName(i)=="Date"};d.clone=function(l){if(!l||typeof l=="function"||d.isDate(l)||typeof l!="object"){return l}var k,j;if(d.isArray(l)){k=[];for(j=0;j<l.length;++j){k.push(d.clone(l[j]))}return k}k={};for(j in l){if(!(j in k)||k[j]!=l[j]){k[j]=d.clone(l[j])}}return k};d.close=function(i,j,k){if(typeof k=="undefined"){return function(){return j.apply(i,arguments)}}else{return function(){return j.apply(i,k)}}};d.createUUID=function(){return h(4)+"-"+h(2)+"-"+h(2)+"-"+h(2)+"-"+h(6)};d.extend=(function(){var i=function(){};return function(k,j){i.prototype=j.prototype;k.prototype=new i();k.__super__=j.prototype;k.prototype.constructor=k}}());d.alert=function(i){if(window.alert){window.alert(i)}else{if(console&&console.log){console.log(i)}}};function h(m){var k="";for(var j=0;j<m;j++){var l=parseInt((Math.random()*256),10).toString(16);if(l.length==1){l="0"+l}k+=l}return k}});window.cordova=b("cordova");b("cordova/init")})();