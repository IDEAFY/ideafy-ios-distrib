/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Authors: Vincent Weyl <vincent.weyl@taiaut.com> - Olivier Wietrich <Olivier.Wietrich@taiaut.com
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Amy/Stack-plugin", "Amy/Control-plugin", 
	"public/public", "library/library", "brainstorm/brainstorm", "connect/connect", "dashboard/dashboard",
	"service/map", "service/config", "./notify", "service/newidea", "service/help", "service/new2q", "service/new2c", "service/tips"], 
	function(Widget, Stack, Control, Public, Library, Brainstorm, Connect, Dashboard, Map, Config, Notify, NewIdea, Help, New2Q, New2C, Tips){
		return function DockConstructor(){

		//declaration
			var _widget = new Widget(),
			    _newIdea,
			    _new2q,
			    _tips,
			    _control = new Control(this),
			    _observer = Config.get("observer"),
			    _user = Config.get("user"),
			    _stack = new Stack();

		//setup
			//labels have to configurable
			_widget.plugins.addAll({
				"dockstack" : _stack,
				"dockcontrol" : _control
			});
			
			_widget.alive(Map.get("dock"));

		//logic
			_widget.init = function init(firstStart){
			        var notify = new Notify();
			        
			        _stack.getStack().add("#public", new Public());
			        _stack.getStack().add("#library", new Library());
				_stack.getStack().add("#brainstorm", new Brainstorm());
				_stack.getStack().add("#connect", new Connect());
				_stack.getStack().add("#dashboard", new Dashboard());
				// init notification engine
				notify.init();
				
				// initialize popups
				_newIdea = new NewIdea();
                                _new2q = new New2Q();
			};
			
			/*
			 * start function is called by body after dock widget is shown (so that wrapper dom becomes avaialble)
			 * used to highlight statrtup screen in the left menu and display tips if and as necessary
			 */
			_widget.start = function start(firstStart){
			        var pub = document.querySelector('a[href="#public"]'),
			            startScreen = document.querySelector('a[href="'+_user.get("settings").startupScreen+'"]');
			         
			         //set current stack view
                                if (!_user.get("settings").startupScreen) _stack.getStack().show("#public")
                                else {
                                       _control.radioClass(startScreen, pub, "selected");
                                       _control.init(startScreen);
                                       _stack.getStack().show(_user.get("settings").startupScreen);
                                       
                                }
                                
                                // show tips if applicable
                                if (firstStart || _user.get("settings").showTips !== false){
                                        _tips = new Tips();
                                        _tips.init(firstStart);
                                }        
			};
			
			_widget.reset = function(){
			     _stack = new Stack();
			     _widget.init();      
			};

			this.setCurrentWidget = function(event){
				var href = event.target.getAttribute("href"), timeout= 3000;
				if(href !== _stack.getStack().getCurrentName()){
				        //hide current submenu if present
                                        _stack.getStack().getCurrentScreen().hideMenu();
                                        
                                        //we show stack widgets this way to reduce listener
					_stack.getStack().show(href);
					
					//display new submenu for a short duration <3s
					_stack.getStack().getCurrentScreen().showMenu();
					setTimeout(function(){_stack.getStack().getCurrentScreen().hideMenu();}, timeout);
				}
				else{
				        //display submenu
				        _stack.getStack().getCurrentScreen().showMenu();
				}
			};
			
	       
               /*
                * Watch for view changing events
                */
                        
                        // replay session
                        _observer.watch("replay-session", function(sid, mode){
                                var prev = document.querySelector(".dock-item.selected"),
                                    bs = document.querySelector(".dock-item[href='#brainstorm']");
                                _stack.getStack().show("#brainstorm");
                                _control.radioClass(bs, prev, "selected");
                                _control.init(bs);             
                        });
                        
                        // display document
                        _observer.watch("display-doc", function(){
                                var prev = document.querySelector(".dock-item.selected"),
                                    lib = document.querySelector(".dock-item[href='#library']");
                                _stack.getStack().show("#library");
                                _control.radioClass(lib, prev, "selected");
                                _control.init(lib);
                        });
                        
                        // display message center
                        _observer.watch("display-message", function(id){
                                var prev = document.querySelector(".dock-item.selected"),
                                    con = document.querySelector(".dock-item[href='#connect']");
                                _stack.getStack().show("#connect");
                                _control.radioClass(con, prev, "selected");
                                _control.init(con);
                        });
                        
                        // display tutorials (dashboard)
                        _observer.watch("display-tutorials", function(id){
                                var prev = document.querySelector(".dock-item.selected"),
                                    dash = document.querySelector(".dock-item[href='#dashboard']");
                                _stack.getStack().show("#dashboard");
                                _control.radioClass(dash, prev, "selected");
                                _control.init(dash);
                        });
                        
                        
		//return
			return _widget;

		};
});