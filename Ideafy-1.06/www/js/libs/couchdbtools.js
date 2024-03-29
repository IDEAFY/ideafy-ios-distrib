/**
 * @license https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

define("CouchDBBase",

["Store", "StateMachine", "Tools", "Promise"],

function CouchDBBase() {

});
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */
define("CouchDBSecurity",

["CouchDBStore"],

/**
 * @class
 * CouchDBSecurity synchronises a CouchDBStore with _security document
 */
function CouchDBSecurity(CouchDBStore) {

        /**
         * Defines CouchDBSecurity
         * @returns {CouchDBSecurityConstructor}
         */
        function CouchDBSecurityConstructor() {

                /**
                 * the name of the _security document
                 * @private
                 */
                var _name = "_security";

                /**
                 * Set the name of the _security document
                 * @param {String} name the name of the docuyment
                 * @returns {Boolean} true if name is truthy
                 */
                this.setName = function setName(name) {
                        if (name){
                                _name = name;
                                return true;
                        } else {
                                return false;
                        }
                };

                /**
                 * Get the name of the _Security document
                 * @returns {String}
                 */
                this.getName = function getName() {
                        return _name;
                };

                /**
                 * Load the security document
                 * @param {String} db the name of the database
                 */
                this.load = function load(db) {
                        return this.sync(db, _name);
                };


        };

        return function CouchDBSecurityFactory() {
                CouchDBSecurityConstructor.prototype = new CouchDBStore;
                return new CouchDBSecurityConstructor;
        };



});
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

define("CouchDBStore",

["Store", "StateMachine", "Tools", "Promise"],

/**
 * @class
 * CouchDBStore synchronises a Store with a CouchDB view or document
 * It subscribes to _changes to keep its data up to date.
 */
function CouchDBStore(Store, StateMachine, Tools, Promise) {

        /**
         * Defines the CouchDBStore
         * @returns {CouchDBStoreConstructor}
         */
        function CouchDBStoreConstructor() {

                /**
                 * The name of the channel on which to run the requests
                 * @private
                 */
                var _channel = "CouchDB",

                /**
                 * The transport used to run the requests
                 * @private
                 */
                _transport = null,

                /**
                 * That will store the synchronization info
                 * @private
                 */
                _syncInfo = {},

                /**
                 * The promise that is returned by sync
                 * It's resolved when entering listening state
                 * It's rejected when no such document to sync to
                 * The promise is initialized here for testing purpose
                 * but it's initialized again in sync
                 * @private
                 */
                _syncPromise = new Promise,

                /**
                 * All the actions performed by the couchDBStore
                 * They'll feed the stateMachine
                 * @private
                 */
                actions = {

                        /**
                         * Get a CouchDB view
                         * @private
                         */
                        getView: function () {

                                _syncInfo.query = _syncInfo.query || {};

                                _transport.request(_channel, {
                                        method: "GET",
                                        path: "/" + _syncInfo.database + "/_design/" + _syncInfo.design + "/" + _syncInfo.view,
                                        query: _syncInfo.query
                                }, function (results) {
                                        var json = JSON.parse(results);
                                        if (!json.rows) {
                                                throw new Error("CouchDBStore [" + _syncInfo.database + ", " + _syncInfo.design + ", " + _syncInfo.view + "].sync() failed: " + results);
                                        } else {
                                                this.reset(json.rows);
                                                _syncPromise.fulfill(this);
                                                if (typeof json.total_rows == "undefined") {
                                                        this.setReducedViewInfo(true);
                                                }

                                                _stateMachine.event("subscribeToViewChanges");
                                        }
                                }, this);
                        },

                        /**
                         * Get a CouchDB document
                         * @private
                         */
                        getDocument: function () {

                                _transport.request(_channel, {
                                        method: "GET",
                                        path: "/" + _syncInfo.database + "/" + _syncInfo.document,
                                        query: _syncInfo.query
                                }, function (results) {
                                        var json = JSON.parse(results);
                                        if (json._id) {
                                                this.reset(json);
                                                _syncPromise.fulfill(this);
                                                _stateMachine.event("subscribeToDocumentChanges");
                                        } else {
                                                _syncPromise.reject(results);
                                        }
                                }, this);
                        },

                        /**
                         * Get a bulk of documents
                         * @private
                         */
                        getBulkDocuments: function () {

                                var reqData = {
                                                        path: "/" + _syncInfo.database + "/_all_docs",
                                                        query: _syncInfo.query
                                                },
                                                errorString;

                                // If an array of keys is defined, we POST it to _all_docs to get arbitrary docs.
                                if (_syncInfo["keys"] instanceof Array) {
                                        reqData.method = "POST";
                                        reqData.data = JSON.stringify({keys:_syncInfo.keys});
                                        reqData.headers = {
                                                "Content-Type": "application/json"
                                        };
                                        errorString = reqData.data;

                                // Else, we just GET the documents using startkey/endkey
                                } else {
                                        reqData.method = "GET";
                                        errorString = JSON.stringify(_syncInfo.query);
                                }

                                _syncInfo.query.include_docs = true;

                                _transport.request(_channel,
                                        reqData,
                                        function (results) {

                                        var json = JSON.parse(results);

                                        if (!json.rows) {
                                                throw new Error("CouchDBStore.sync(\"" + _syncInfo.database + "\", " + errorString + ") failed: " + results);
                                        } else {
                                                this.reset(json.rows);
                                                _syncPromise.fulfill(this);
                                                _stateMachine.event("subscribeToBulkChanges");
                                        }
                                }, this);

                        },

                        /**
                         * Put a new document in CouchDB
                         * @private
                         */
                        createDocument: function (promise) {
                _transport.request(_channel, {
                        method: "PUT",
                        path: "/" + _syncInfo.database + "/" + _syncInfo.document,
                        headers: {
                                "Content-Type": "application/json"
                        },
                        data: this.toJSON()
                }, function (result) {
                        var json = JSON.parse(result);
                        if (json.ok) {
                                this.set("_rev", json._rev);
                                promise.fulfill(json);
                                _stateMachine.event("subscribeToDocumentChanges");
                        } else {
                                promise.reject(json);
                        }
                }, this);
            },

            /**
             * Subscribe to changes when synchronized with a view
             * @private
             */
            subscribeToViewChanges: function () {

                Tools.mixin({
                                        feed: "continuous",
                                        heartbeat: 20000,
                                        descending: true
                                }, _syncInfo.query);

                this.stopListening = _transport.listen(_channel, {
                                                path: "/" + _syncInfo.database + "/_changes",
                                                query: _syncInfo.query
                                        },
                                        function (changes) {
                                                // Should I test for this very special case (heartbeat?)
                                                // Or do I have to try catch for any invalid json?
                                                if (changes == "\n") {
                                                        return false;
                                                }
                                                console.log(_syncInfo.query);
                                                var json = JSON.parse(changes),
                                                        action;

                                                // reducedView is known on the first get view
                                                if (_syncInfo.reducedView) {
                                                        action = "updateReduced";
                                                } else {
                                                        if (json.deleted) {
                                                                action = "delete";
                                                        } else if (json.changes && json.changes[0].rev.search("1-") == 0) {
                                                                action = "add";
                                                        } else {
                                                                action = "change";
                                                        }
                                                }

                                                _stateMachine.event(action, json.id);
                                        }, this);
                        },

                        /**
                         * Subscribe to changes when synchronized with a document
                         * @private
                         */
                        subscribeToDocumentChanges: function () {

                                this.stopListening = _transport.listen(_channel, {
                                        path: "/" + _syncInfo.database + "/_changes",
                                        query: {
                                                 feed: "continuous",
                                                 heartbeat: 20000,
                                                 descending: true
                                                }
                                        },
                                function (changes) {
                                        var json;
                                        // Should I test for this very special case (heartbeat?)
                                        // Or do I have to try catch for any invalid json?
                                        if (changes == "\n") {
                                                return false;
                                        }

                                        json = JSON.parse(changes);

                                        // The document is the modified document is the current one
                                        if (json.id == _syncInfo.document &&
                                                // And if it has a new revision
                                                json.changes.pop().rev != this.get("_rev")) {

                                                if (json.deleted) {
                                                        _stateMachine.event("deleteDoc");
                                                } else {
                                                        _stateMachine.event("updateDoc");
                                                }
                                         }
                                }, this);
                        },

                        /**
                         * Subscribe to changes when synchronized with a bulk of documents
                         * @private
                         */
                        subscribeToBulkChanges: function () {
                                Tools.mixin({
                                        feed: "continuous",
                                        heartbeat: 20000,
                                        descending: true,
                                        include_docs: true
                                }, _syncInfo.query);

                this.stopListening = _transport.listen(_channel, {
                                                path: "/" + _syncInfo.database + "/_changes",
                                                query: _syncInfo.query
                                        },
                                        function (changes) {
                                                var json;
                                                // Should I test for this very special case (heartbeat?)
                                                // Or do I have to try catch for any invalid json?
                                                if (changes == "\n") {
                                                        return false;
                                                }
                                                       console.log(_syncInfo.query, changes);
                                                var json = JSON.parse(changes),
                                                        action;

                                                if (json.changes[0].rev.search("1-") == 0) {
                                                        action = "bulkAdd";
                                                } else if (json.deleted) {
                                                        action = "delete";
                                                } else {
                                                        action = "bulkChange";
                                                }

                                                _stateMachine.event(action, json.id, json.doc);


                                        }, this);
                        },

                        /**
                         * Update in the Store a document that was updated in CouchDB
                         * Get the whole view :(, then get the modified document and update it.
                         * I have no choice but to request the whole view and look for the document
                         * so I can also retrieve its position in the store (idx) and update the item.
                         * Maybe I've missed something
                         * @private
                         */
                        updateDocInStore: function (id) {
                                _transport.request(_channel,{
                                        method: "GET",
                                        path: "/" + _syncInfo.database + "/_design/" + _syncInfo.design + "/" + _syncInfo.view,
                                        query: _syncInfo.query
                                }, function (view) {
                                        var json = JSON.parse(view);

                                        if (json.rows.length == this.getNbItems()) {
                                                json.rows.some(function (value, idx) {
                                                        if (value.id == id) {
                                                                this.set(idx, value);
                                                        }
                                                }, this);
                                        } else {
                                                this.actions.evenDocsInStore.call(this, json.rows, id);
                                        }

                                }, this);

                        },

                        /**
                         * When a doc is removed from the view even though it still exists
                         * or when it's added to a view, though it wasn't just created
                         * This function must be called to even the store
                         * @private
                         */
                        evenDocsInStore: function (view, id) {
                                var nbItems = this.getNbItems();

                                // If a document was removed from the view
                                if (view.length < nbItems) {

                                        // Look for it in the store to remove it
                                        this.loop(function (value, idx) {
                                                if (value.id == id) {
                                                        this.del(idx);
                                                }
                                        }, this);

                                // If a document was added to the view
                                } else if (view.length > nbItems) {

                                        // Look for it in the view and add it to the store at the same place
                                        view.some(function (value, idx) {
                                                if (value.id == id) {
                                                        return this.alter("splice", idx, 0, value);
                                                }
                                        }, this);

                                }

                        },

                        /**
                         * Add in the Store a document that was added in CouchDB
                         * @private
                         */
                        addBulkDocInStore: function (id) {
                                if (_syncInfo["query"].startkey || _syncInfo["query"].endkey) {
                                        _syncInfo.query.include_docs = true;
                                        _syncInfo.query.update_seq = true;

                                        _transport.request(_channel, {
                                                method: "GET",
                                                path: "/" + _syncInfo.database + "/_all_docs",
                                                query: _syncInfo.query
                                        },
                                        function (results) {

                                                var json = JSON.parse(results);

                                                json.rows.forEach(function (value, idx) {
                                                        if (value.id == id) {
                                                                this.alter("splice", idx, 0, value.doc);
                                                        }
                                                }, this);

                                        }, this);
                                } else {
                                        return false;
                                }
                        },

                        /**
                         * Update in the Store a document that was updated in CouchDB
                         * @private
                         */
                        updateBulkDocInStore: function (id, doc) {
                                this.loop(function (value, idx) {
                                                if (value.id == id) {
                                                        this.set(idx, doc);
                                                }
                                        }, this);
                        },

                        /**
                         * Remove from the Store a document that was removed in CouchDB
                         * @private
                         */
                        removeDocInStore: function (id) {
                                this.loop(function (value, idx) {
                                        if (value.id == id) {
                                                this.del(idx);
                                        }
                                }, this);
                        },

                        /**
                         * Add in the Store a document that was added in CouchDB
                         * @private
                         */
                        addDocInStore: function (id) {
                                _transport.request(_channel,{
                                        method: "GET",
                                        path: "/" + _syncInfo.database + "/_design/" + _syncInfo.design + "/" + _syncInfo.view,
                                        query: _syncInfo.query
                                }, function (view) {
                                        var json = JSON.parse(view);

                                        json.rows.some(function (value, idx) {
                                                if (value.id == id) {
                                                        this.alter("splice", idx, 0, value);
                                                }
                                        }, this);

                                }, this);
                        },

                        /**
                         * Update a reduced view (it has one row with no id)
                         * @private
                         */
                        updateReduced: function () {
                                _transport.request(_channel,{
                                        method: "GET",
                                        path: "/" + _syncInfo.database + "/_design/" + _syncInfo.design + "/" + _syncInfo.view,
                                        query: _syncInfo.query
                                }, function (view) {
                                        var json = JSON.parse(view);

                                        this.set(0, json.rows[0]);

                                }, this);
                        },

                        /**
                         * Update the document when synchronized with a document.
                         * This differs than updating a document in a View
                         * @private
                         */
                        updateDoc: function () {
                                _transport.request(_channel, {
                                        method: "GET",
                                        path: "/"+_syncInfo.database+"/" + _syncInfo.document
                                }, function (doc) {
                                        this.reset(JSON.parse(doc));
                                }, this);
                    },

                    /**
                     * Delete all document's properties
                     * @private
                     */
                    deleteDoc: function () {
                        this.reset({});
                    },

                    /**
                     * Update a document in CouchDB through a PUT request
                     * @private
                     */
                    updateDatabase: function (promise) {

                        _transport.request(_channel, {
                        method: "PUT",
                        path: "/" + _syncInfo.database + "/" + _syncInfo.document,
                        headers: {
                                "Content-Type": "application/json"
                        },
                        data: this.toJSON()
                }, function (response) {
                        var json = JSON.parse(response);
                        if (json.ok) {
                                this.set("_rev", json.rev);
                                promise.fulfill(json);
                        } else {
                                promise.reject(json);
                        }
                }, this);
                    },

                    /**
                     * Update the database with bulk documents
                     * @private
                     */
                    updateDatabaseWithBulkDoc: function (promise) {

                        var docs = [];
                        this.loop(function (value) {
                                docs.push(value.doc);
                        });

                        _transport.request(_channel, {
                                method: "POST",
                                path: "/" + _syncInfo.database + "/_bulk_docs",
                                headers: {
                                        "Content-Type": "application/json"
                                },
                                data: JSON.stringify({"docs": docs})
                        }, function (response) {
                                promise.fulfill(JSON.parse(response));
                });
                    },

                    /**
                     * Remove a document from CouchDB through a DELETE request
                     * @private
                     */
                    removeFromDatabase: function () {
                        _transport.request(_channel, {
                        method: "DELETE",
                        path: "/" + _syncInfo.database + "/" + _syncInfo.document,
                        query: {
                                rev: this.get("_rev")
                        }
                });
                    },

             /**
              * The function call to unsync the store
              * @private
              */
             unsync: function () {
                 this.stopListening();
                 delete this.stopListening;
             }
                },

                /**
                 * The state machine
                 * @private
                 * it concentrates almost the whole logic.
                 */
                _stateMachine = new StateMachine("Unsynched", {
                        "Unsynched": [
                            ["getView", actions.getView, this, "Synched"],
                                ["getDocument", actions.getDocument, this, "Synched"],
                                ["getBulkDocuments", actions.getBulkDocuments, this, "Synched"]
                         ],

                        "Synched": [
                            ["updateDatabase", actions.createDocument, this],
                            ["subscribeToViewChanges", actions.subscribeToViewChanges, this, "Listening"],
                                ["subscribeToDocumentChanges", actions.subscribeToDocumentChanges, this, "Listening"],
                                ["subscribeToBulkChanges", actions.subscribeToBulkChanges, this, "Listening"],
                                ["unsync", function noop(){}, "Unsynched"]
                         ],

                        "Listening": [
                            ["change", actions.updateDocInStore, this],
                            ["bulkAdd", actions.addBulkDocInStore, this],
                            ["bulkChange", actions.updateBulkDocInStore, this],
                                ["delete", actions.removeDocInStore, this],
                                ["add", actions.addDocInStore, this],
                                ["updateReduced", actions.updateReduced, this],
                                ["updateDoc", actions.updateDoc, this],
                            ["deleteDoc", actions.deleteDoc, this],
                            ["updateDatabase", actions.updateDatabase, this],
                            ["updateDatabaseWithBulkDoc", actions.updateDatabaseWithBulkDoc, this],
                            ["removeFromDatabase", actions.removeFromDatabase, this],
                            ["unsync", actions.unsync, this, "Unsynched"]
                           ]

                });

                /**
                 * Synchronize the store with a view
                 * @param {String} database the name of the database where to get...
                 * @param {String} ...design the design document, in which...
                 * @param {String} view ...the view is.
                 * @returns {Boolean}
                 */
                this.sync = function sync() {

                        _syncPromise = new Promise;

                        if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] == "string") {
                                this.setSyncInfo(arguments[0], arguments[1], arguments[2], arguments[3]);
                                _stateMachine.event("getView");
                                return _syncPromise;
                        } else if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] != "string") {
                                this.setSyncInfo(arguments[0], arguments[1], arguments[2]);
                                _stateMachine.event("getDocument");
                                return _syncPromise;
                        } else if (typeof arguments[0] == "string" && arguments[1] instanceof Object) {
                                this.setSyncInfo(arguments[0], arguments[1]);
                                _stateMachine.event("getBulkDocuments");
                                return _syncPromise;
                        }
                        return false;
                };

                /**
                 * Set the synchronization information
                 * @private
                 * @returns {Boolean}
                 */
                this.setSyncInfo = function setSyncInfo() {
                        this.clearSyncInfo();
                        if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] == "string") {
                                _syncInfo["database"] = arguments[0];
                                _syncInfo["design"] = arguments[1];
                                _syncInfo["view"] = arguments[2];
                                _syncInfo["query"] = arguments[3];
                                return true;
                        } else if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] != "string") {
                                _syncInfo["database"] = arguments[0];
                                _syncInfo["document"] = arguments[1];
                                _syncInfo["query"] = arguments[2];
                                return true;
                        } else if (typeof arguments[0] == "string" && arguments[1] instanceof Object) {
                                _syncInfo["database"] = arguments[0];
                                _syncInfo["query"] = arguments[1];
                                if (_syncInfo["query"].keys instanceof Array) {
                                        _syncInfo["keys"] = _syncInfo["query"].keys;
                                        delete _syncInfo["query"].keys;
                                }
                                return true;
                        }
                        return false;
                };

                /**
                 * Between two synchs, the previous info must be cleared up
                 * @private
                 */
                this.clearSyncInfo = function clearSyncInfo() {
                        _syncInfo = {};
                        return true;
                };

                /**
                 * Set a flag to tell that a synchronized view is reduced
                 * @private
                 */
                this.setReducedViewInfo = function setReducedViewInfo(reduced) {
                        if (typeof reduced == "boolean") {
                                _syncInfo.reducedView = reduced;
                                _syncInfo.query = {};
                                return true;
                        } else {
                                return false;
                        }
                };

                /**
                 * Get the synchronization information
                 * @private
                 * @returns
                 */
                this.getSyncInfo = function getSyncInfo() {
                        return _syncInfo;
                };

                /**
                 * Unsync a store. Unsync must be called prior to resynchronization.
                 * That will prevent any unwanted resynchronization.
                 * Notice that previous data will still be available.
                 * @returns
                 */
                this.unsync = function unsync() {
                        return _stateMachine.event("unsync");
                };

                /**
                 * Upload the document to the database
                 * Works for CouchDBStore that are synchronized with documents or bulk of documents.
                 * If synchronized with a bulk of documents, you can set the documents to delete _deleted property to true.
                 * No modification can be done on views.
                 * @returns true if upload called
                 */
                this.upload = function upload() {
                        var promise = new Promise;
                        if (_syncInfo.document) {
                                _stateMachine.event("updateDatabase", promise);
                                return promise;
                        } else if (!_syncInfo.view){
                                _stateMachine.event("updateDatabaseWithBulkDoc", promise);
                                return promise;
                        }
                        return false;
                };

                /**
                 * Remove the document from the database
                 * @returns true if remove called
                 */
                this.remove = function remove() {
                        if (_syncInfo.document) {
                                return _stateMachine.event("removeFromDatabase");
                        }
                        return false;
                };

                /**
                 * The transport object to use
                 * @param {Object} transport the transport object
                 * @returns {Boolean} true if
                 */
                this.setTransport = function setTransport(transport) {
                        if (transport && typeof transport.listen == "function" && typeof transport.request == "function") {
                                _transport = transport;
                                return true;
                        } else {
                                return false;
                        }
                };

                /**
                 * Get the state machine
                 * Also only useful for debugging
                 * @private
                 * @returns {StateMachine} the state machine
                 */
                this.getStateMachine = function getStateMachine() {
                        return _stateMachine;
                };

                /**
                 * Get the current transport
                 * Also only useful for debugging
                 * @private
                 * @returns {Object} the current transport
                 */
                this.getTransport = function getTransport() {
                        return _transport;
                };

                /**
                 * The functions called by the stateMachine made available for testing purpose
                 * @private
                 */
                this.actions = actions;

        };

        return function CouchDBStoreFactory(data) {
                CouchDBStoreConstructor.prototype = new Store(data);
                return new CouchDBStoreConstructor;
        };

});
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */
define("CouchDBUser",

["CouchDBStore", "Promise"],

/**
 * @class
 * CouchDBUser synchronises a CouchDBStore with a CouchDB User.
 * It also provides tools to ease the creation/modification of users.
 */
function CouchDBUser(CouchDBStore, Promise) {

        /**
         * Defines CouchDBUser
         * @returns {CouchDBUserConstructor}
         */
        function CouchDBUserConstructor() {

                /**
                 * the name of the table in which users are saved
                 * @private
                 */
                var _userDB = "_users",

                /**
                 * the string which prefixes a user's id
                 * @private
                 */
                _idPrefix = "org.couchdb.user:";

                /**
                 * Get the name of the users' db
                 * @returns {String}
                 */
                this.getUserDB = function getUserDB() {
                        return _userDB;
                };

                /**
                 * Set the name of the users' db
                 * @param {String} name of the db
                 * @returns {Boolean} true if name truthy
                 */
                this.setUserDB = function setUserDB(name) {
                        if (name) {
                                _userDB = name;
                                return true;
                        } else {
                                return false;
                        }
                };

                /**
                 * Get the string that prefixes the users' id
                 * @returns {String}
                 */
                this.getIdPrefix = function getIdPrefix() {
                        return _idPrefix;
                };

                /**
                 * Set the string that prefixes the users' id
                 * @param {String} name string that prefixes the users' id
                 * @returns {Boolean} true if name truthy
                 */
                this.setIdPrefix = function setIdPrefix(name) {
                        if (name) {
                                _idPrefix = name;
                                return true;
                        } else {
                                return false;
                        }
                };

                /**
                 * Set user's id
                 * @param {String} id
                 * @returns {Boolean} true if id truthy
                 */
                this.setId = function setId(id) {
                        if (id) {
                                this.set("_id", _idPrefix + id);
                                return true;
                        } else {
                                return false;
                        }
                };

                /**
                 * Get the user's id
                 * @returns {String} the user's id
                 */
                this.getId = function getId() {
                        return this.get("_id");
                };

                /**
                 * Load a user given it's id
                 * @param {String} id of the user (without prefix)
                 * @returns {Boolean} true if sync succeeded
                 */
                this.load = function load(id) {
                        return this.sync(_userDB, _idPrefix + id);
                };

                /**
                 * Gets the user profile in couchDB by using its own credentials.
                 * name and password must be set prior to calling login, or the promise will be rejected.
                 * If the login is successful, the promise is fulfilled with the user information like:
                 * { _id: 'org.couchdb.user:couchdb',
                 *  _rev: '1-8995e8ff247dae75048ab2dc800136d7',
                 * name: 'couchdb',
                 * password: null,
                 * roles: [],
                 * type: 'user' }
                 *
                 * @returns {Promise}
                 */
                this.login = function login() {
                        var promise = new Promise,
                                name = this.get("name"),
                                password = this.get("password");

                        if (name && typeof name == "string" && typeof password == "string") {
                                this.getTransport().request("CouchDB", {
                                        method: "GET",
                                        path: "/_users/org.couchdb.user:"+name,
                                        auth: name + ":" + password
                                },
                                promise.fulfill,
                                promise);
                        } else {
                                promise.reject({
                                        error: "name & password must be strings"
                                });
                        }

                        return promise;
                };

                /**
                 * Adds a user to the database
                 * The following fields must be set prior to calling create:
                 * name: the name of the user
                 * password: its desired password, NOT encrypted
                 *
                 * If not specified, the following fields have default values:
                 * type: "user"
                 * roles: []
                 *
                 * The function itself will not warn you for incorrect fields
                 * but the promise that is returned will fulfilled with couchdb's reply.
                 * @returns {Promise}
                */
                this.create = function create() {
                        var promise = new Promise;

                        if (!this.get("type")) {
                                this.set("type", "user");
                        }

                        if (!this.get("roles")) {
                                this.set("roles", []);
                        }

                        this.load(this.get("name")).then(function () {
                                promise.reject({error: "Failed to create user. The user already exists"});
                        }, function () {
                                this.upload().then(function (success) {
                                        promise.fulfill(success);
                                }, function (error) {
                                        promise.reject(error);
                                });
                        }, this);

                        return promise;
                };
        };

        return function CouchDBUserFactory() {
                CouchDBUserConstructor.prototype = new CouchDBStore;
                return new CouchDBUserConstructor;
        };



});
