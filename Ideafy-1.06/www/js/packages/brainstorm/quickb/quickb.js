/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Amy/Stack-plugin", "Bind.plugin", "Event.plugin", "./quickstart", "./quicksetup", "./quickscenario", "./quicktech", "./quickidea", "./quickwrapup", "CouchDBStore", "service/config", "Promise", "Store", "lib/spin.min"],
        function(Widget, Map, Stack, Model, Event, QuickStart, QuickSetup, QuickScenario, QuickTech, QuickIdea, QuickWrapup, CouchDBStore, Config, Promise, Store, Spinner){
                
           return function QuickBConstructor($sip, $exit){
                   
                   // declaration
                   var _widget = new Widget(),
                       _progress = new Widget(),
                       _frag = document.createDocumentFragment(),
                       _dom = Map.get("ideafy-quick"),
                       _stack = new Stack(),
                       _labels = Config.get("labels"),
                       _steps = new Store([
                               {name: "quickstart", label: _labels.get("quickstepstart"), currentStep: true, status:"ongoing"},
                               {name: "quicksetup", label: _labels.get("quickstepsetup"), currentStep: false, status:null},
                               {name: "quickscenario", label: _labels.get("quickstepscenario"), currentStep: false, status:null},
                               {name: "quicktech", label: _labels.get("quicksteptech"), currentStep: false, status:null},
                               {name: "quickidea", label: _labels.get("quickstepidea"), currentStep: false, status:null},
                               {name: "quickwrapup", label: _labels.get("quickstepwrapup"), currentStep: false, status:null}
                               ]),
                       _user = Config.get("user"),
                       _session = new CouchDBStore(),
                       _sessionData = new Store(),
                       spinner = new Spinner({color:"#9AC9CD", lines:10, length: 20, width: 8, radius:15}).spin();
                   
                   _widget.plugins.add("quickstack", _stack);
                   _widget.alive(_dom);
                   
                   _progress.plugins.addAll({
                           "labels" : new Model(_labels),
                           "step" : new Model(_steps, {
                                   setCurrent : function(currentStep){
                                           (currentStep) ? this.classList.add("pressed") : this.classList.remove("pressed");
                                   },
                                   setActive : function(status){
                                           (status) ? this.classList.remove("inactive") : this.classList.add("inactive");
                                   }
                           }),
                           "progressevent" : new Event(_progress)
                   });
                   _progress.template = '<div class = "progressbar invisible"><ul id = "quicksteplist" class="steplist" data-step="foreach"><li class="step inactive" data-step="bind: innerHTML, label; bind:setCurrent, currentStep; bind:setActive, status" data-progressevent="listen: touchstart, highlightStep; listen:touchend, changeStep"></li></ul><div class="exit-brainstorm" data-progressevent="listen: touchstart, press; listen:touchend, exit"></div></div>';
                   
                   _progress.place(_widget.dom);
                   
                   // UI methods
                   
                   _progress.highlightStep = function(event, node){
                        node.classList.toggle("inactive");        
                   };
                   
                   _progress.changeStep = function(event, node){
                        var _id = node.getAttribute("data-step_id");
                        // only change if new step status is not null
                        if (_steps.get(_id).status){
                                _steps.loop(function(v,i){
                                        (_id == i) ? _steps.update(i, "currentStep", true) : _steps.update(i, "currentStep", false);
                                });
                                _stack.getStack().show(_steps.get(_id).name);
                                //_widget.toggleProgress(node);
                        }
                        else {
                                event.stopImmediatePropagation();
                        }
                        _progress.dom.classList.add("invisible");             
                   };
                   
                   _progress.press = function(event, node){
                           node.classList.add("pressed");
                   };
                   
                   _progress.exit = function(event, node){
                           node.classList.remove("pressed");
                           _progress.dom.classList.add("invisible");
                           $exit();
                   };
                   
                   _widget.retrieveSession = function retrieveSession(sip){
                           
                           spinner.spin(document.getElementById("brainstorm"));
                           
                           // reset local session data
                           _sessionData.reset();
                           
                           // connect to couchdbstore and retrieve session
                           _session.unsync();
                           _session.reset();
                           _session.sync(Config.get("db"), sip.id).then(function(){
                                var step = _session.get("step"), current = 10000, length = _steps.getNbItems();
                                
                                // reset step UIs
                                _stack.getStack().get("quickstart").reset(sip);
                                _stack.getStack().get("quicksetup").reset(sip);
                                _stack.getStack().get("quickscenario").reset(sip);
                                _stack.getStack().get("quicktech").reset(sip);
                                _stack.getStack().get("quickidea").reset(sip);
                                _stack.getStack().get("quickwrapup").reset(sip);
                                
                                // check session's current step and set as active
                                _steps.loop(function(v, i){
                                        if (i<current){
                                                if (v.name === step){
                                                        current = i;
                                                        _steps.update(i, "currentStep", true);
                                                        (v.name === "quickwrapup") ? _steps.update(i, "status", "done") : _steps.update(i, "status", "ongoing");
                                                        
                                                } 
                                                else _steps.update(i, "status", "done");       
                                        }      
                                });
                                
                                // if session is complete display wrapup screen else display start screen
                                if (step === "quickwrapup"){
                                        spinner.stop();
                                        _stack.getStack().show("quickwrapup");
                                        _steps.update(0, "currentStep", false);
                                }
                                else{
                                        // set quick start as current step
                                        _steps.update(0, "currentStep", true);
                                        _steps.update(current, "currentStep", false);
                                        spinner.stop();
                                        _stack.getStack().show("quickstart");
                                        //update user session in progress if and only if session is not complete
                                        if (_session.get("status") !== "completed"){
                                                _user.set("sessionInProgress", sip);
                                                _user.upload();
                                        }
                                }
                           }, function(err){
                                   spinner.stop();
                                   alert("session could not be retrieved");
                           });
                   };
                   
                   _widget.startNewSession = function startNewSession(){
                        
                        // create new session document
                        _session.unsync(); // just to be sure
                        _session.reset(Config.get("sessionTemplate"));
                         //reset local session data
                        _sessionData.reset({});
                        
                        // set session initiator to current user
                        _session.set("initiator", {"id": _user.get("_id"),"username": _user.get("username"),"picture_file": _user.get("picture_file")});
                        
                        // set session mode to quick & current step to "quickstart"
                        _session.set("mode", "quick");
                        _session.set("step", "quickstart");
                        
                        // set session deck to active deck
                        _session.set("deck", _user.get("active_deck"));
                        
                        // reset all step UIS
                        _stack.getStack().get("quickstart").reset();
                        _stack.getStack().get("quicksetup").reset();
                        _stack.getStack().get("quickscenario").reset();
                        _stack.getStack().get("quicktech").reset();
                        _stack.getStack().get("quickidea").reset();
                        _stack.getStack().get("quickwrapup").reset();
                        
                        // display first step
                        _stack.getStack().show("quickstart");
                   };
                   
                   _widget.reset = function reset(sip){
                        // reset progress bar
                        _steps.reset([
                               {name: "quickstart", label: _labels.get("quickstepstart"), currentStep: true, status:"ongoing"},
                               {name: "quicksetup", label: _labels.get("quickstepsetup"), currentStep: false, status:null},
                               {name: "quickscenario", label: _labels.get("quickstepscenario"), currentStep: false, status:null},
                               {name: "quicktech", label: _labels.get("quicksteptech"), currentStep: false, status:null},
                               {name: "quickidea", label: _labels.get("quickstepidea"), currentStep: false, status:null},
                               {name: "quickwrapup", label: _labels.get("quickstepwrapup"), currentStep: false, status:null}
                               ]);
                           
                        (sip) ?  _widget.retrieveSession(sip) : _widget.startNewSession();  
                   };
                   
                   _widget.prev = function prev(currentName){
                        var _id;
                        _steps.loop(function(value, idx){
                                if (value.name === currentName){
                                        _id = idx;
                                }
                        });
                        if (_id>0) {
                                _steps.update(_id, "currentStep", false);
                                _steps.update(_id-1, "currentStep", true);
                                _stack.getStack().show(_steps.get(_id-1).name);
                        }
                        else {
                                alert("Exiting session");
                                $exit();
                        }            
                   };
                   
                   _widget.next = function next(currentName){
                        var _id,
                            _nextui,
                            _currentui = _stack.getStack().get(currentName);
                            promise = new Promise();
                            
                        _steps.loop(function(value, idx){
                                if (value.name === currentName){
                                        _id = idx;
                                }
                        });
                        
                        if (_id < _steps.getNbItems()-1) {
                                
                                // update progress bar
                                _steps.update(_id, "currentStep", false);
                                _steps.update(_id+1, "currentStep", true);
                                
                                // if previous step was already done do not modify status
                                if (_steps.get(_id).status !== "done"){
                                        _steps.update(_id, "status", "done");
                                        _steps.update(_id+1, "status", "ongoing");
                                        
                                        _session.set("step", _steps.get(_id+1).name);
                                        _session.upload().then(function(){
                                                _nextui = _stack.getStack().get(_steps.get(_id+1).name);
                                                if (_nextui.initTimer) _nextui.initTimer();
                                                _currentui.stopSpinner();
                                                _stack.getStack().show(_steps.get(_id+1).name);
                                                promise.fulfill();        
                                        });
                                }
                                else {
                                        _currentui.stopSpinner();
                                        _stack.getStack().show(_steps.get(_id+1).name);
                                        promise.fulfill();
                                }
                        }
                        
                        return promise;       
                   };
                   
                   _widget.toggleProgress = function toggleProgress(){
                           _progress.dom.classList.toggle("invisible");      
                   };
                   
                   _widget.init = function init(sip){
                           
                           // setup -- initialize UIs (progress bar and stack) and _session couchdbstore
                           _session.setTransport(Config.get("transport"));
                           
                           _stack.getStack().add("quickstart", new QuickStart(_session, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("quicksetup", new QuickSetup(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("quickscenario", new QuickScenario(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("quicktech", new QuickTech(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("quickidea", new QuickIdea(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("quickwrapup", new QuickWrapup(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress));
                           
                           _widget.reset(sip);
                   };
                   
                   // init
                   _widget.init($sip);
                   
                   // watch for reconnect events and resync session if it already has an id
                   Config.get("observer").watch("reconnect", function(){
                        if (_session.get("_id")){
                                _session.unsync();
                                _session.sync(Config.get("db"), _session.get("_id"));
                        }        
                   });
                   
                   // return
                   return _widget;
           };    
        });
