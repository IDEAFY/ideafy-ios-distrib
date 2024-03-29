/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Store", "Bind.plugin", "Event.plugin", "service/map", "service/utils", "service/avatar", "service/config", "twocents/writetwocent", "twocents/twocentlist", "Observable", "Promise", "CouchDBDocument", "Place.plugin", "lib/spin.min"], 
        function(Widget, Store, Model, Event, Map, Utils, Avatar, Config, WriteTwocent, TwocentList, Observable, Promise, CouchDBDocument, Place, Spinner){
                return function PublicDetailConstructor($action){
                //declaration
                        var  _widget = new Widget(),
                             _twocentWriteUI = new WriteTwocent(),
                             _publicTwocentList= new TwocentList("public"),
                             _labels = Config.get("labels"),
                             vote = new Store([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]),
                             _voted = false,
                             user = Config.get("user"),
                             transport = Config.get("transport"),
                             _store = new CouchDBDocument(),
                             _dom = Map.get("public-detail"),
                             _domWrite,
                             _obs = new Observable();

                //setup
                        _store.setTransport(transport);
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "publicdetail" : new Model(_store, {
                                        // toggle header buttons right
                                        toggleFavEdit : function(authors){
                                                var node = this;
                                                if (authors.indexOf(user.get("_id"))>-1) {
                                                        node.setAttribute("href", "#public-edit");
                                                }
                                                else{
                                                        node.setAttribute("href", "#public-favorites");
                                                        // check if idea is already a user's favorite
                                                        (user.get("public-favorites") && (user.get("public-favorites").indexOf(_store.get("_id"))>-1)) ? node.classList.add("unfav") : node.classList.remove("unfav");
                                                    
                                                        user.watchValue("public-favorites", function(val){
                                                                (val.indexOf(_store.get("_id"))>-1) ? node.classList.add("unfav"): node.classList.remove("unfav");        
                                                        });
                                                }     
                                        },
                                        // toggle header buttons left
                                        toggleTwocentShare : function(authors){
                                            (authors.indexOf(user.get("_id"))>-1) ? this.setAttribute("href", "#public-share") : this.setAttribute("href", "#public-2cents");       
                                        },
                                        // display twocents writing interface if applicable
                                        displayWriteTwocent : function(authors){
                                            (authors.indexOf(user.get("_id"))<0) ? this.classList.remove("invisible") : this.classList.add("invisible");    
                                        },
                                        // hide twocent write if twocents are present
                                        displayTwocentList : function(twocents){
                                                if (twocents && twocents.length){
                                                    // hide twocent write interface    
                                                    document.getElementById("public-writetwocents").classList.add("invisible");
                                                 }        
                                        },
                                        date : function date(date){
                                                if (date) this.innerHTML = Utils.formatDate(date);
                                        },
                                        setAuthor : function(authornames){
                                                if (authornames === user.get("username") && _store.get("authors").indexOf(user.get("_id"))>-1){
                                                        this.innerHTML = _labels.get("youlbl");
                                                }
                                                else {
                                                        this.innerHTML = authornames;
                                                }
                                        },
                                        setWrotelbl : function(authors){
                                                if (authors.length === 1 && authors[0]=== user.get("_id")){
                                                        this.innerHTML = _labels.get("youwrotelbl");
                                                }
                                                else if (authors.length >1) this.innerHTML = _labels.get("theywrotelbl");
                                                else {
                                                        this.innerHTML = _labels.get("ideawrotelbl");
                                                }        
                                        },
                                        setAvatar : function setAvatar(authors){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar(authors);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        },
                                        setRating : function setRating(votes) {
                                                
                                                if (votes.length === 0) {this.innerHTML = "";}
                                                else {
                                                        this.innerHTML = Math.round(votes.reduce(function(x,y){return x+y;})/votes.length*100)/100;
                                                }
                                        },
                                        setDescription : function setDescription(desc){
                                                this.innerHTML = desc.replace(/\n/g, "<br>");        
                                        },
                                        setSolution : function setSolution(sol){
                                                this.innerHTML = sol.replace(/\n/g, "<br>");        
                                        },
                                        // display a vote button or the number of votes on an idea
                                        toggleVoteButton : function(votes){
                                                var idea = _store.get("_id"),
                                                    authors = _store.get("authors");
                                                
                                                // hide rating popup if present
                                                document.getElementById("ratingPopup").classList.remove("appear"); 
                                                // check if user has already voted on this idea or if user is author
                                                if (user.get("rated_ideas").indexOf(idea)<0 && authors.indexOf(user.get("_id"))<0 && !_voted)
                                                {
                                                        this.setAttribute("name", "vote");
                                                        this.innerHTML = _labels.get("votebuttonlbl");
                                                        this.classList.remove("votes");
                                                        this.classList.add("publicButton");
                                                }
                                                else{
                                                        _voted = true;
                                                        this.classList.remove("publicButton");
                                                        this.setAttribute("name", "voted");
                                                        if (votes.length === 0){
                                                                this.innerHTML = "("+_labels.get("novotesyet")+")";
                                                        }
                                                        else if (votes.length === 1){
                                                                this.innerHTML = "("+ _labels.get("onevote")+")";
                                                        }
                                                        else{
                                                                this.innerHTML = "("+votes.length + " "+_labels.get("votes")+")";
                                                        }
                                                        this.classList.add("votes");
                                                }               
                                        }
                                }),
                                "vote" : new Model(vote,{
                                        setIcon : function(active){
                                                var styleActive = "background: url('img/public/activeIdeaVote.png') no-repeat center center;",
                                                    styleInactive = "background: url('img/public/rateForList.png') no-repeat center center;";
                                                (active) ? this.setAttribute("style", styleActive) : this.setAttribute("style", styleInactive);
                                        }
                                }),
                                "place" : new Place({"PublicTwocentUI": _publicTwocentList}),
                                "publicdetailevent" : new Event(_widget)
                        });

                        _widget.template='<div class="public-idea"><div class="header blue-dark"><a href="#public-2cents" data-publicdetail="bind: toggleTwocentShare, authors" data-publicdetailevent="listen: touchstart, action" class="option left"></a><span data-label="bind: innerHTML, publicdetailsheadertitle"></span><a href="#public-favorites" data-publicdetail="bind: toggleFavEdit, authors" data-publicdetailevent="listen: touchstart, action" class="option right"></a></div><div id="idea-cache"></div><div class = "detail-contents"><div class="detail-header"><div class="avatar" data-publicdetail="bind:setAvatar, authors"></div><h2 data-publicdetail="bind:innerHTML,title"></h2><span class="date" data-publicdetail="bind:date, creation_date"></span><br><span class="author" data-publicdetail="bind:setAuthor,authornames"></span><span class="commentlbl" data-publicdetail="bind: setWrotelbl, authors"></span></div><div class="detail-body"><legend class="idealegend" data-label="bind:innerHTML, principle"></legend><p class="ideap" data-publicdetail="bind:setDescription,description"></p><legend class="idealegend" data-label="bind:innerHTML, solution"></legend><p class="ideap" data-publicdetail="bind:setSolution,solution"></p></div><div class="detail-footer"><div class ="rateIdea"><a class="item-acorn"></a><div class="rating" data-publicdetail="bind:setRating,votes"></div><div class="publicButton" data-publicdetail="bind:toggleVoteButton, votes" name="vote" data-publicdetailevent="listen: touchstart, press; listen: touchend, vote;" data-label="bind: innerHTML, votebuttonlbl"></div><div id="ratingPopup" class="popup"><ul class="acorns" data-vote="foreach"><li class="item-acorn" data-vote="bind: setIcon, active" data-publicdetailevent="listen: touchstart, previewVote; listen: touchend, castVote"></li></ul></div></div></div></div><div id="public-writetwocents" class="invisible" data-publicdetail="bind: displayWriteTwocent, authors"></div><div id="public-twocents" class="twocents" data-publicdetail="bind: displayTwocentList, twocents" data-place="place: PublicTwocentUI"></div></div>';
                
                //Public
                        _widget.showCache = function showCache(){
                                _widget.dom.querySelector("#idea-cache").classList.remove("invisible");        
                        };
                        
                        _widget.hideCache = function hideCache(){
                                _widget.dom.querySelector("#idea-cache").classList.add("invisible");        
                        };
                        
                        _widget.reset = function reset(viewStore, index){
                                
                                var id = viewStore.get(index).id,
                                    promise = new Promise();
                                
                                // reset voting popup
                                vote.reset([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]);
                                
                                // synchronize with idea
                                _widget.getIdea(id).then(function(){
                                        // when clicking on a new idea -- reset _voted param to false, idea store and pass idea's id to twocents
                                        _voted = false;
                                        _twocentWriteUI.reset(_store.get("_id"));
                                        _publicTwocentList.reset(_store.get("_id"));
                                        _domWrite = document.getElementById("public-writetwocents");
                                        _twocentWriteUI.place(_domWrite); 
                                        promise.fulfill();     
                                });
                                return promise;
                        };
                        
                        _widget.getIdea = function getIdea(id){
                                // reinitialize couchdbstore
                                _store.unsync();
                                _store.reset();
                                
                                return _store.sync(Config.get("db"), id);       
                        };
                        
                        _widget.action = function(event, node){
                                var name = node.getAttribute("href"),
                                    id = _store.get("_id"),
                                    fav, idx,
                                    favSpinner = new Spinner({color:"#FFFFFF", lines:8, length: 6, width: 3, radius:6, left: 3, top: 3});
                                switch(name){
                                        case "#public-2cents":
                                                _twocentWriteUI.reset(id);
                                                _domWrite.classList.remove("invisible");
                                                break;
                                        case "#public-favorites":
                                                node.classList.add("favwait");
                                                favSpinner.spin(node);
                                                (user.get("public-favorites")) ? fav = user.get("public-favorites").concat() : fav = [];
                                                
                                                idx = fav.indexOf(id);
                                                (idx > -1) ? fav.splice(idx, 1) : fav.push(id);
                                                
                                                if (fav.length < 100 || fav.length < user.get("public-favorites").length){
                                                        user.unsync();
                                                        user.sync(Config.get("db"), user.get("_id"))
                                                        .then(function(){
                                                                user.set("public-favorites", fav);
                                                                return user.upload();
                                                        })
                                                        .then(function(){
                                                                favSpinner.stop();
                                                                node.classList.remove("favwait");
                                                                if (idx>-1){
                                                                        alert(_labels.get("removedfav"));
                                                                        node.classList.remove("unfav");
                                                                }
                                                                else{
                                                                        alert(_labels.get("addedfav"));
                                                                        node.classList.add("unfav");
                                                                }
                                                        });
                                                }
                                                else {
                                                        alert(_labels.get("maxfavsize"));
                                                        favSpinner.stop();
                                                        node.classList.remove("favwait");
                                                }
                                                
                                                break;
                                        default:
                                                $action(name);
                                                break;
                                }       
                        };
                        
                        _widget.edit = function(){
                             _stack.getStack().show("#public-edit");     
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.vote = function(event, node){
                                if (!_voted){
                                        //display voting popup
                                        document.getElementById("ratingPopup").classList.add("appear");
                                }
                                node.classList.remove("pressed");
                        };
                        
                        _widget.previewVote = function(event, node){
                             var i=0, idx = node.getAttribute("data-vote_id");
                             vote.loop(function(v,i){
                                     (i<=idx) ? vote.update(i, "active", true):vote.update(i, "active",false);        
                             });            
                        };
                        
                        _widget.castVote = function(event, node){
                                var grade = parseInt(node.getAttribute("data-vote_id"))+1,
                                    id = _store.get("_id"),
                                    json = {id : id, vote: grade, voter: user.get("_id")};
                                
                                // prevent multiple votes on the same idea -- if request fails or before database is updated 
                                if (!_voted){
                                        _voted = true;
                                        transport.request("Vote", json, function(result){
                                                var ri = user.get("rated_ideas") || [];
                                                if (result !== "ok"){
                                                        console.log(result, "something went wrong, please try again later");
                                                        _voted = false;
                                                }
                                                else {
                                                        // update user store locally to keep consistency
                                                        ri.unshift(id);
                                                        user.set("rated_ideas", ri);
                                                        alert(Config.get("labels").get("thankyou"));
                                                        // update polling list
                                                        Config.get("observer").notify("update-polling");
                                                        //cleanup 1- remove popup 2- hide vote button 3- reset vote store
                                                        document.getElementById("ratingPopup").classList.remove("appear");
                                                        vote.reset([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]);
                                                }
                                        });
                                }
                        };
                        
                        _widget.place(_dom);
                        

                //return
                        return _widget;
                };
        });