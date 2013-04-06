/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "Store"],
        function(Widget, Map, Model, Event, Config, Store){
                
                function ConfirmConstructor($parent, $question, $onDecision){
                
                        var _labels = Config.get("labels"),
                                _widget = this,
                            _content = new Store({"question":""});
                        
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "confirm" : new Model(_content),
                                "confirmevent" : new Event(this)
                        });
                        
                        _widget.template = '<div class = "confirm"><div class="help-doctor"></div><p class="confirm-question" data-confirm="bind:innerHTML,question"></p><div class="option left" data-confirmevent="listen:touchstart, press; listen:touchend, ok" data-label="bind: innerHTML, continuelbl">Continue</div><div class="option right" data-confirmevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl">Cancel</div></div>';
                        
                        _widget.press = function(event, node){
                                event.stopPropagation();
                                node.classList.add("pressed");
                        };
                        
                        _widget.ok = function(event, node){
                                node.classList.remove("pressed");
                                $onDecision(true);    
                        };
                        
                        _widget.cancel = function(event, node){
                                node && node.classList.remove("pressed");
                                $onDecision(false);
                        };
                        
                        _widget.close = function close(){
                                $parent.removeChild($parent.lastChild);       
                        };
                        
                        _content.set("question", $question);
                        _widget.render();
                        _widget.place($parent);
                        
                        setTimeout(function(){_widget.close;}, 15000);
                        
                }
                        
                return function ConfirmFactory($parent, $question, $onDecision){
                        ConfirmConstructor.prototype = new Widget();
                        return new ConfirmConstructor($parent, $question, $onDecision);
                };
        });
