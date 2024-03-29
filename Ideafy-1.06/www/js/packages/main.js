/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

require(["OObject", "LocalStore", "Store", "service/map", "Amy/Stack-plugin", "Bind.plugin", "Amy/Delegate-plugin", "./dock", "./login", "service/config", "CouchDBStore", "service/utils", "Promise"], 
    function(Widget, LocalStore, Store, Map, Stack, Model, Event, Dock, Login, Config, CouchDBStore, Utils, Promise) {
        
        //declaration
        var _body = new Widget(), _login = null, _stack = new Stack({
                "#login" : _login
        }), _dock = new Dock(), _local = new LocalStore(), updateLabels = Utils.updateLabels, checkServerStatus = Utils.checkServerStatus, _labels = Config.get("labels"), _db = Config.get("db"), _transport = Config.get("transport"), _user = Config.get("user");

        //setup
        _body.plugins.addAll({
                "stack" : _stack
        });
        
        //logic
        _body.init = function init(firstStart) {
                
                // synchronize user document
                _user.sync(_db, _local.get("currentLogin")).then(function() {
                        var lblUpdate = false;
                        
                        // set uid for future queries
                        Config.set("uid", '"' + _user.get("_id") + '"');
                        // check user defined language
                        if (_user.get("lang") !== Config.get("lang")) {
                                lblUpdate = true;
                        }
                        
                        // add dock UI to the stack
                        _stack.getStack().add("#dock", _dock);
                        
                         // get user avatar and labels if necessary
                         if (_user.get("picture_file").search("img/avatars/deedee")>-1){
                                Config.set("avatar", _user.get("picture_file"));
                                if (lblUpdate){
                                        updateLabels(_user.get("lang")).then(function(){
                                                lblUpdate = false;
                                                _dock.init();
                                                //if everything is downloaded
                                                _stack.getStack().show("#dock");
                                                _dock.start(firstStart);      
                                        }); 
                                }
                                else{
                                        _dock.init();
                                        //if everything is downloaded
                                        _stack.getStack().show("#dock");
                                        _dock.start(firstStart);
                                }
                        }
                        // if avatar is customized no need to wait for labels download (shorter than avatar file)
                        else{
                                if (lblUpdate) updateLabels(_user.get("lang")).then(function(){lblUpdate = false;});
                                _transport.request("GetFile", {sid: "avatars", "filename":_user.get("_id")+"_@v@t@r"}, function(result){
                                        if (!result.error) {
                                                Config.set("avatar", result);
                                                _dock.init();
                                                //if everything is downloaded
                                                _stack.getStack().show("#dock");
                                                _dock.start(firstStart);
                                        }
                                        else alert(result.error);
                                });
                        }
                });       
        };
        
        _body.alive(Map.get("body"));
        
        // INITIALIZATION
        
        // retrieve local data
        _local.sync("ideafy-data");
        _login = new Login(_body.init, _local);
        _stack.getStack().show("#login");
        _stack.getStack().setCurrentScreen(_login);
        _login.init();
        
        // check connection
        if (navigator.connection && navigator.connection.type === "none"){
                // get labels or assign default ones
                (_local.get("labels")) ? _labels.reset(_local.get("labels")) : _labels.reset(Config.get("defaultLabels"));
                Config.set("lang", _labels.set("language"));
                _login.setScreen("#nointernet");
        }
        else {
                checkServerStatus().then(function(result){
        
                        // initialize labels to device language if available or US by default
                        if (_local.get("labels")) {
                                _labels.reset(_local.get("labels"));
                                Config.set("lang", _labels.get("language"));
                        }
                        else{
                                updateLabels(navigator.language);
                        }

                        var current = _local.get("currentLogin") || "";
                
                        // if the last user is in the local storage show login if not display signup screen
                        if (!current) {
                                //display signup
                                _login.setScreen("#signup-screen");
                        }
                        else {
                                _transport.request("CheckLogin", {"id" : current}, function(result) {
                                        if (result.authenticated) {_body.init();}
                                        else {
                                                _login.setScreen("#login-screen");
                                        }
                                });
                        }
                
                }, function(error){
                        (_local.get("labels")) ? _labels.reset(_local.get("labels")) : _labels.reset(Config.get("defaultLabels"));
                        _login.setScreen("#maintenance-screen");
                });
        }
               
        /*
         * Manage socket connectivity
         */
        document.addEventListener("pause", Utils.disconnectSocket);
        document.addEventListener("resume", Utils.checkSocketStatus);
                
        // attempt to reconnect socket if required in case of user actions
        Map.get("body").addEventListener("touchstart", Utils.checkSocketStatus);
        
        // resync user document upon socket reconnection
        Config.get("observer").watch("reconnect", function(){
                _local.sync("ideafy-data");
                _user.unsync();
                _user.sync(_db, _local.get("currentLogin")).then(function(){
                        console.log("user resynchronized");
                });       
        });
}); 