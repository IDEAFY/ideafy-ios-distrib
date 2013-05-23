/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Store", "SocketIOTransport", "CouchDBStore", "Observable"], function(Store, Transport, CouchDBStore, Observable) {
        var _location, _socket, _transport, _user, _observer, _config = new Store();
        
        this.reset = function(){
                 
                //_transport = new Transport(io, "http://37.153.96.26:1664"); // uncomment for app deployment
                _location = "http://37.153.96.26:1664";
                //_location = location.origin;
                _socket = io.connect(_location);
                _transport = new Transport(_socket);
                _user =  new CouchDBStore();
                _observer = new Observable();
                _user.setTransport(_transport);
                
                _config.reset({
                        location : _location,
                        socket : _socket,
                        transport : _transport,
                        db : "ideafy",
                        user : _user,
                        observer : _observer,
                        polling_interval : 60000,
                        userTemplate : {
                                "lastname" : "",
                                "firstname" : "",
                                "address" : {
                                        "street1" : "",
                                        "street2" : "",
                                        "zip" : null,
                                        "state": "",
                                        "city" : "",
                                        "country" : ""
                                },
                                "gender" : 1,
                                "lang" : "en-us",
                                "birthdate" : [],
                                "connections" : [],
                                "taiaut_decks" : ["INT"],
                                "custom_decks" : [],
                                "active_deck": "INT",
                                "occupation" : {
                                        "situation" : "",
                                        "job" : "",
                                        "organization" : ""
                                },
                                "family" : {
                                        "couple" : null,
                                        "children" : null
                                },
                                "leisure_activities" : [
                                        {"name" : "", "comment" : ""},
                                        {"name" : "", "comment" : ""},
                                        {"name" : "", "comment" : "" }
                                ],
                                "interests" : [
                                        {"name" : "", "comment" : ""},
                                        {"name" : "", "comment" : ""},
                                        {"name" : "", "comment" : ""}],
                                "type" : 7,
                                "notifications" : [],
                                "facebook" : "",
                                "twitter" : "",
                                "gplus" : "",
                                "linkedin" : "",
                                "username" : "",
                                "sessionInProgress" : {},
                                "organization" : "",
                                "rated" : [],
                                "rated_ideas" : [],
                                "favorites" : [],
                                "ip" : 0,
                                "picture_file" : "img/avatars/deedee0.png",
                                "intro" : "Ideafyer",
                                "title" : null,
                                "achievements" : [],
                                "ideas_count" : 0,
                                "su_sessions_count" : 0,
                                "mu_sessions_count": 0,
                                "twocents_count" : 0,
                                "twoquestions_count" : 0,
                                "tutorial_complete" : false,
                                "profile_complete" : false,
                                "news" : [],
                                "twocents" : [],
                                "twoquestions" : [],
                                "settings": {"notifyPopup": true, "useascharacter": false, "ccme": false, "privacy_lvl": 0, "showTips": true, "startupScreen": "#public", "listSize": null, "polling_interval": 60000}
                        },
                        ideaTemplate:{
                                "title": "",
                                "sessionId": "",
                                "sessionReplay": false,
                                "authors": [],
                                "description": "",
                                "solution": "",
                                "creation_date": [],
                                "character": "",
                                "problem": "",
                                "lang": "en-us",
                                "context": "",
                                "techno": [],
                                "type": 6,
                                "sharedwith": [],
                                "modification_date": [],
                                "inspired_by": "",
                                "visibility": "private",
                                "votes": [],
                                "rating": "",
                                "authornames": "",
                                "twocents": []
                        },
                        TQTemplate:{
                                "author": [],
                                "question": "",
                                "creation_date": [],
                                "lang": "en-us",
                                "type": 10,
                                "modification_date": [],
                                "votes": [],
                                "rating": "",
                                "username": "",
                                "twocents": []
                        },
                        sessionTemplate : {
                                "title" : "",
                                "description" : "",
                                "initiator" : {
                                        "id" : "",
                                        "username" : "",
                                        "picture_file" : ""
                                },
                                "participants" : [],
                                "date" : [],
                                "startTime" : null,
                                "resumeTime" : null,
                                "duration" : null,
                                "elapsedTime" : 0,
                                "elapsedTimers" : {},
                                "mode" : "",
                                "type" : 8,
                                "deck" : "",
                                "status" : "in progress",
                                "step" : "",
                                "lang" : "en-us",
                                "characters" : [],
                                "contexts" : [],
                                "problems" : [],
                                "scenarioWB" : [],
                                "scenario" : [], //{"title" : "", "story" : "", "solution" : ""}
                                "techno" : [[]],
                                "ideaWB" : [],
                                "idea" : [], //{"title" : "", "description" : "", "solution" : "", "visibility" : "private", "id" : "" }
                                "score" : "",
                                "sessionReplay" : false
                        },
                        avatars : new Store({}), // to keep frequently used avatars (.e.g connections)
                        avatar : null, // user's avatar
                        defaultLabels : {
        "language": "en-us",
        "emailplaceholder": "Email",
        "passwordplaceholder": "Password",
        "repeatpasswordplaceholder": "Confirm password",
        "loginbutton": "Log in",
        "newuserbutton": "New user",
        "invalidlogin": "Invalid username or password",
        "missingloginparam": "Please enter both username and password or register",
        "signupmissingemail": "Please enter your email address in the field above",
        "signupmissingpwd": "A password is required",
        "signupmissingpwdok": "Please confirm your password",
        "signupmissingfn": "Please enter your first name",
        "signupmisingln": "Please enter your last name",
        "signupinvalidemail": "Invalid email address",
        "signuppwdnomatch": "Passwords do not match",
        "signupwelcomeobject": "Welcome to Ideady",
        "signupwelcomebody": "Thank you for trying Ideafy. We hope you'll enjoy it. We designed it so you can manage ideas that matter to you or just play around. But don't keep what you're doing to yourself.",
        "signupbutton": "Sign up",
        "Initialization": "Initializing user data. Please wait ...",
        "firstnameplaceholder": "First name",
        "lastnameplaceholder": "Last name",
        "createidealbl" : "Enter a new idea",
        "ideatitleplaceholder": "Enter a title for your idea",
        "ideadescplaceholder": "Enter a description of your idea in non technical terms",
        "ideasolplaceholder": "Describe how your idea would work, what components, products, services or technologies you would  use",
        "privatelbl": "Private",
        "publiclbl": "Public",
        "ideavisiblelbl": "Your idea is ",
        "setideavisiblelbl" : "Change status:",
        "ideafyreplaylbl": "Ideafy Replay is",
        "ideafysetreplaylbl": "Change Ideafy Replay status: ",
        "enabledreplaylbl": "Enabled",
        "disabledreplaylbl": "Disabled",
        "enablereplaylbl": "Enable",
        "disablereplaylbl": "Disable",
        "oklbl": "Ok",
        "continuelbl": "Continue",
        "setpublicquestion": "Warning, every Ideafy user will be able to view your idea. This operation is irreversible. Do you want to proceed?",
        "publicideasheadertitle": "Public Ideas",
        "searchpublicplaceholder": "Search public ideas...",
        "ideadetailsheadertitle": "Idea Overview",
        "idealistheadertitle": "My Ideas",
        "searchprivateplaceholder": "Search your ideas...",
        "modifyidealbl": "Modify your idea",
        "sendidealbl": "Email your idea",
        "sharedwith": "Shared with ",
        "ideafyer" : " Ideafyer",
        "ideafyers" : " Ideafyers",
        "votebuttonlbl": "Vote",
        "novotesyet": "No vote yet",
        "onevote": "1 vote",
        "votes": "votes",
        "ideawrotelbl": " wrote : ",
        "twocentcommentlbl": "commented :",
        "youwrotelbl": "wrote :",
        "theywrotelbl": "wrote :",
        "youcommentedlbl": "commented :",
        "youlbl" : "You",
        "hidetwocentreplies": "Hide replies",
        "showonetcreply": "Reply",
        "showtcrepliesbefore": "",
        "showtcrepliesafter": " Replies",
        "twocentreplycommentlbl": "replied :",
        "yourepliedlbl": "replied :",
        "addtwocentplaceholder": "Add your two cents",
        "addtwocentreplyplaceholder" : "Respond to this comment",
        "twocentcreationdate":"Creation date: ",
        "twocentmodificationdate": "Last modified: ",
        "cancellbl": "Cancel",
        "publishlbl": "Publish",
        "titlefield" : "Title field",
        "descriptionfield": "Description field",
        "solutionfield": "Solution field",
        "emptyfielderror": " cannot be left empty",
        "somethingwrong": "Something went wrong, please try again later",
        "thankyou": "Thank you",
        "loadingmessage": "Application loading, please wait...",
        "maintenancemessage": "We're sorry. The server is currently unavailable. Please come back later.",
        "library-ideas": "My Ideas",
        "library-sessions": "My Ideafy Sessions",
        "sbytitle": "Session title",
        "sbydate": "Date",
        "sbyidea": "Idea title",
        "sbyscore": "Score",
        "searchsessions": "Search previous sessions...",
        "foundlbl": "Found",
        "matchingsessions": "matching session(s)",
        "noideayet": "---",
        "completed": "completed",
        "inprogress": "in progress",
        "noscore": "no score yet",
        "deletereplay": "This session has the Ideafy replay feature enabled. Are you sure you want to delete it?",
        "library-decks": "My Ideafy decks",
        "brainstormheadertitle": "Brainstorm",
        "brainstormchoosemode": "Choose your Ideafy mode",
        "continuesession": "Continue last session",
        "quickbmode" : "Quick mode session",
        "quickstart" : "Describe your session",
        "quickstarthelp" : "<h2>Why is this step important?</h2><p>Giving your session a name and other background information will make it easier to retrieve later on from your library. Besides, it's always interesting to keep track of the particular context in which ideas or other contents were generated. If you are setting up a multi-user session, this will provide important context information to invitees and may persuade them to join.</p>",
        "quickstarttitle" : "Name your session",
        "quickstarttitleplaceholderpre" : "",
        "quickstarttitleplaceholderpost" : "'s session",
        "quickstartdesc": "Enter a description of your session",
        "quickstartdescplaceholder": "Date, context, purpose, ...",
        "nextbutton": "Next",
        "finishbutton": "Ready",
        "quicksetup": "Set up a situation",
        "quicksetuphelp": "<h2>Setting the stage</h2><p>This step lets you setup a random situation. Draw and select one card of each of the following categories: character, context, problem. They will be the starting point of your session. You can zoom in on each card to get additional information, select a different one by clicking on the deck icon at the top or accept it (thumbs-up button).</p><p>Which is it going to be ? Will you let fortune decide what situation you are going to deal with or will you work the stacks until you get one you are comfortable with? Ideafy encourages you to pick random situations because they force you to think outside the box.</p><p>Note that when you start a <i>Custom session</i> you can specify one or more of your starting cards to address specific situations.</p>",
        "credits": "Credits : ",
        "source": "Source : ",
        "dyknow": "Did you know ?",
        "agelbl": " year old",
        "hobbieslbl": "Leisure activities",
        "interestslbl": "Centers of interest",
        "commentslbl": "Comments",
        "singlelbl": "single",
        "marriedlbl": "married",
        "divorcedlbl": "divorced",
        "widowlbl": "widow",
        "nochildlbl": "no children",
        "onechildlbl": " child",
        "childrenlbl": " children",
        "siblingslbl": " siblings",
        "onesiblinglbl": " sibling",
        "quickscenario": "Write your story",
        "quickscenariohelp": "<p>This is your <strong>whiteboard.</strong></p><p>Now is the time to show your creativity and imagination. The cards you just picked give you a scope, a set of directions to project your thoughts. Use them as hints but do not feel overly constrained: they are here to help you <strong>write your own story and describe your own use case</strong>.</p><p>Finding the problem to solve is often the most important step of an innovation. So get started and use the tools below to <strong>post any thought, drawing or picture that will help you focus on a story.</strong></p><br><p>When you are done, click on the <strong>ready</strong> button at the bottom to write up your story.</p>",
        "choosecolorlbl": "Choose a color",
        "importlbl": "Choose a picture",
        "importpiclbl": "Choose a picture",
        "importcameralbl": "Take a picture",
        "pencilsizelbl": "Size",
        "pencilcolorlbl": "Color",
        "drawbgcolorlbl": "Background",
        "cleardrawinglbl": "Clear",
        "storytitleplaceholder": "Enter the title of your story",
        "storydescplaceholder": "Tell your story, describe the problem your character is facing",
        "storysolplaceholder": "How would you plan to fix this problem ?",
        "quicktech": "Assign technologies",
        "quicktechhelp":"<h2>Draw technologies</h2><p>The next phase of your session consists in finding a way to implement your solution using state of the art technologies. In this step you will draw three technology cards that you will try to include in your design.</p>",
        "tech1lbl": "Techno 1",
        "tech2lbl": "Techno 2",
        "tech3lbl": "Techno 3",
        "scenariolbl": "Scenario",
        "storytitlelbl": "Your Story",
        "cdtitlelbl": "Title : &nbsp",
        "scenariodesclbl": "Scenario description",
        "soldesclbl": "Solution description",
        "quickidea": "Describe your idea",
        "quickideahelp": "<p>Welcome back to your <strong>whiteboard.</strong></p><p>Your goal now is to try to apply the technologies that you just picked to design a solution to the use case described in your scenario.</p><p>Again do not feel too constrained: at this stage you can either alter your scenario to accomodate a technology, add additional technologies to the ones you have drawn to complete your solution or skip some of these if they do not fit in your design.</p><p>You are almost done: at the end of this step you will be able to refine your use case and turn it into an <strong>idea</strong>. You will be asked to provide a description in layman terms and also to describe how you would implement it with your chosen technologies.</p><br><p>When you are done, clik on the <strong>ready</strong> button at the bottom to write up your story.</p>",
        "quickwrapup": "Summary",
        "quickstepstart": "Session description",
        "quickstepsetup": "Setup",
        "quickstepscenario": "Scenario",
        "quicksteptech": "Technologies",
        "quickstepidea": "Solution",
        "quickstepwrapup": "Summary",
        "congratulations": "Congratulations !",
        "sessioncompleted": "You successfully completed your Ideafy session",
        "ideatitlelbl": "Your Idea",
        "scenarioheader": "Scenario",
        "scenariosolution": "Solution",
        "ideadescription": "Idea description",
        "ideaimplementation": "Technical implementation",
        "yourtime": "Your time",
        "yourscore": "Your score",
        "musession": "Multi-user session",
        "customsession": "Custom session",
        "ideafytutorial": "ideafy tutorial",
        "connect-contacts": "Contacts",
        "connect-messages": "Messages",
        "connect-twocents": "Two cents",
        "dashboard-profile": "My profile",
        "dashboard-settings": "Settings",
        "dashboard-about": "About Ideafy",
        "tolbl": "To : ",
        "subjectlbl": "Subject : ",
        "yourmessage": "Your message to ",
        "sentok": " has been sent.",
        "sentdocmsg": " sent you an Ideafy document",
        "notavalidaddress": " is not a valid email address",
        "norecipient": "No email address specified",
        "sendlbl": "Send",
        "sharelbl": "Share",
        "msglistheadertitle": "My Messages",
        "notificationlbl": "Notifications",
        "allbtn": "View all",
        "msgbtn": "Messages",
        "notifbtn": "Notifications",
        "unreadbtn": "Unread",
        "searchmsgplaceholder": "Search ...",
        "messageview" : "Message panel",
        "replyalllbl" : "Reply all",
        "forwardlbl" : "Forward",
        "deletelbl" : "Delete",
        "newmsg": "New message",
        "cclbl": "Cc :",
        "tocontactlbl": "Contact :",
        "entersubjectlbl": "Please enter a subject",
        "notavalidcontact": " is not a contact",
        "messagesentok": "Your message has been sent",
        "on" : "On ",
        "contactview" : "Contact panel",
        "contactlistheadertitle" : "My Contacts",
        "usrbtn": "Users",
        "grpbtn": "Groups",
        "newcontactlbl": "New contact",
        "addcontactnow": "Add your contact now",
        "lookup": "Or look up the Ideafy database",
        "beforecount": "The <strong>Ideafy community</strong> now counts <strong>",
        "aftercount": " <strong>users </strong> merrily crafting and exchanging ideas.<br>Look up your acquaintances and friends in the community and connect.",
        "addcontactrightintro": "Building up your address book is the best and fastest way to increase exposure of your ideas and thoughts, but also to get access to a much broader content.",
        "searchcontactplaceholder": "Enter email address of the person you wish to connect with ...",
        "clearemailfirst": "Please clear the email field first",
        "needbothfnln": "Both first and last names are required",
        "selectcontact": "Select contact and press + to invite",
        "noentryfound": "No matching entry in the database",
        "cannotaddself": "You cannot add a connection to yourself",
        "alreadyconnected": " is already a contact",
        "alreadysentCXR": "You already sent a connection request to ",
        "CXRobject": " wants to be a connection",
        "CXRsent" : "Your connection request has been sent",
        "addamessage": "Add a message",
        "accept": "Accept",
        "reject": "Reject",
        "acceptedCXR": " has accepted your connection request",
        "rejectedCXR": " has declined your connection request",
        "CXRaccepted": "Request accepted, ",
        "CXRrejected": "Contact request rejected",
        "isnowacontact": " is now a contact",
        "isnolongeracontact": " is no longer a contact",
        "canceledCX": " has canceled your connection",
        "newfolderlbl" : "New group",
        "groupnamelbl": "Group name",
        "groupdesclbl": "Group description",
        "colortouch": "A colorful touch is always nice",
        "char": "Character",
        "context": "Context",
        "problem": "Problem",
        "grpcontacts": "Group contacts",
        "addgrpcontacts": "Add contacts",
        "nogrpname": "Please enter a group name",
        "nogrpintro": "Please provide a group description",
        "grpnameexists": "A group with this name already exists",
        "nocontactselected": "Please add at least one contact to your group",
        "profilelbl": "My Profile",
        "aboutlbl": "About Ideafy",
        "settingslbl": "Application parameters",
        "completionprefix": "Your profile is ",
        "completionsuffix": "% complete",
        "info": "information",
        "leaderboard": "leaderboard",
        "enterbirthdate": "Provide your date of birth",
        "entergender": "Indicate your gender",
        "enterfamily": "Complete your family status",
        "enteraddress": "Specify your address",
        "enterintro": "Change your introduction",
        "enteroccupation": "Describe your occupation",
        "enterleisure": "Provide at least two leisure activities",
        "enterinterest": "Provide at least two areas of interest",
        "entersocialnw": "Add a social network",
        "enterownpic": "Customize your avatar",
        "completeprofile": "<i>Complete your profile</i>",
        "mystatslbl": "My Stats",
        "ideaslbl": "Public Ideas",
        "sessionslbl": "Sessions",
        "contactslbl": "Contacts",
        "toquestionslbl": "Twoquestions",
        "recentactivitylbl": "Recent Activity",
        "enterednewidea": "You entered a new idea: ",
        "reachedrank": "Congratulations ! You made a new rank :",
        "gotaward": "You received an award : ",
        "posted2q": "You posted a TwoQuestion :",
        "commentedon": "You commented on : ",
        "by": " by ",
        "profileintro": "Profile introduction",
        "shortprofiledesc": "Short profile description",
        "day": "Day",
        "dob": "Date of birth",
        "jan": "January",
        "feb": "February",
        "mar": "March",
        "apr": "April",
        "may": "May",
        "jun": "June",
        "jul": "July",
        "aug": "August",
        "sep": "September",
        "oct": "October",
        "nov": "November",
        "dec": "December",
        "year": "Year",
        "mailaddress": "My Address",
        "street": "Street",
        "city": "City",
        "state": "State",
        "zip": "ZIP code",
        "country": "Country",
        "myfamily": "My Family",
        "single": "Single",
        "married": "Married",
        "divorced": "Divorced",
        "widow": "Widow",
        "relation": "In a relationship",
        "children": "Children",
        "myoccupation": "My Occupation",
        "student": "Student",
        "active": "Active",
        "retired": "Retired",
        "unemployed": "Unemployed",
        "stayathome": "Stay at home parent",
        "jobtitle": "Job title",
        "organization": "Organization",
        "name": "Name",
        "comment": "Comment",
        "field": "Field",
        "updatelbl": "Update",
        "selectavatar": "Or select an avatar",
        "uploadcomplete": "Upload complete",
        "mynotes" : "My Notes",
        "writesomething" : "Write something",
        "stats" : "Stats",
        "achievements" : "Achievements",
        "decklistheadertitle" : "My Decks",
        "ideafypoints" : " Ideafy Points",
        "version": "Version : ",
        "groupupdated": "Group updated",
        "socialnwlbl": "Social networks",
        "designedby": "Designed by : ",
        "mtcheadertitle": "My Two Cents Wall",
        "userpref": "User Preferences",
        "brainstormsettings": "Brainstorm Settings",
        "aboutIdeafy": "About Ideafy",
        "faq": "FAQ",
        "tutorials": "Tutorials",
        "userguide": "User Guide",
        "support": "Support",
        "eula": "View License Agreement",
        "page" : "Page ",
        "supportlegend" : "A question or an issue?",
        "supportplaceholder" : "Enter your text and send",
        "requestsent": "Thank you ! Your request has been sent",
        "createquestion" : "New TwoQuestion",
        "questionplaceholder" : "Enter your question",
        "noquestion" : "Please enter a question",
        "lengthexceeded" : "Maximum question length reached",
        "characters" : " characters",
        "publicidealbl" : "Public Idea",
        "privateidealbl" : "Private Idea",
        "publicwarning" : "<b>WARNING :</b> publishing your idea as a public one is irreversible. Visit Ideafy's dashboard to learn more.",
        "uploadinprogress" : "Upload in progress",
        "notifyingcontacts" : " Notifying contacts",
        "askednew" : " has asked a new TwoQuestion",
        "melbl" : "Me",
        "nowconnected" : " are now connected with ",
        "noreplyyet" : "No reply yet",
        "mytwoquestions" : "My TwoQuestions",
        "mytwocents" : "My Twocents",
        "twoqprefix" : "",
        "twoqsuffix" :"'s TwoQuestions",
        "notwoqyet" : "This Ideafyer has not posted any TwoQuestion yet",
        "mytqdetailheader" : "My TwoQuestion",
        "tqheaderprefix" : "",
        "tqheadersuffix" : "'s TwoQuestion",
        "selecttq" : "Select a contact to diplay TwoQuestions",
        "mytwocentwall" : "My Twocent Wall",
        "sendtcprefix" : "Send a Twocent to ",
        "sendtcsuffix" : "",
        "twocentplaceholder" : "Write your two cents",
        "nomessage" : "Please enter a message",
        "sendinginprogress" : "Sending in progress",
        "senttc": " wrote you a new Twocent",
        "selectall" : "Select all",
        "shareok" : "Document shared successfully",
        "signaturelbl" : "Signature",
        "sharing" : "Sharing : ",
        "messagecenter" : "Message Center",
        "twocentview": "Twocent Center",
        "twocentcenter" : "TwoQuestions & Twocents",
        "about-taiaut" : "About Taiaut",
        "ideafydesc" : "Look at Ideafy as your personal accelerator of ideas. You need ideas? Browse the database of ideas shared by other Ideafyers, ask your network or craft new ones using the embedded brainstorming engine. You have creative ideas? Ideafy makes it easy to share them with your network or to expose them to a community of innovative minds. Start discussions, ask questions or just give your two cents. Your Ideafyer friends want to find out what is on your mind. Ideation is fun. Get started and earn as many Ideafy Points and achievements as you can. Will you be the King of Ideas?",
        "taiautdesc" : "Taiaut was founded in May 2012 by three partners passionate about innovation and new technology. The aim of the company is to take advantage of leading edge communication technologies to advance creative ideas and best innovation practices globally. The company is headquartered in Boersch, France",
        "solene" : "Solène Troussé",
        "oliviers" : "Olivier Scherrer",
        "olivierw" : "Olivier Wietrich",
        "vincent" : "Vincent Weyl",
        "contribsolene" : "User interface design",
        "contribscherrer" : "Framework design and development",
        "contribwietrich" : "User Interface development and software packaging",
        "contribvincent" : "Application conception & lead developer",
        "public" : "Public wall",
        "library" : "My Library",
        "brainstorm" : "Brainstorming center",
        "connect" : "Communication Center",
        "dashboard" : "Dashboard",
        "notips" : "Do not show tips at startup",
        "showtips" : "Show tips at startup",
        "shownotif" : "Show notification popup",
        "setlang" : "Choose your language",
        "choosestartup" : "Choose your startup screen",
        "usechar" : "Allow my profile to be used as an Ideafy character (my name will not be shown)",
        "changepwd" : "Change password",
        "changelbl" : "Change",
        "brainstormtutorial" : "Brainstorming tutorial",
        "twoway" : "Support is a two-way street",
        "supportusintro" : "Ideafy is a free application and we intend to keep it that way. We are committed to bringing you the best experience. Here are a few things you can do to help us support you better:",
        "asanideafyer": "As an Ideafyer",
        "asanexec":"As a business executive",
        "asadev":"As a developer",
        "asaninvest":"As an investor",
        "ideafyerhelp": "Tell us how you feel by rating the application. If you encounter an issue please use the form above and we will try to fix it speedily. All your feedback is welcome and really helps us improve Ideafy.",
        "exechelp": "If you feel like your business could become even more innovative by using such a platform internally or with your partners, we do propose standalone deployments or dedicated instances. This will not be free but we offer ultra competitive conditions. Contact us with the form above or via our <a onclick='window.open(\"http://www.taiaut.com\", \"_system\");'>website</a>",
        "devhelp": "Ideafy exists thanks to three javascript libraries written by the company partners. They are released under MIT licenses and are available here : <a onclick='window.open(\"http://github.com/flams/emily\", \"_system\");'>emily</a>, <a onclick='window.open(\"http://github.com/flams/olives\", \"_system\");'>olives</a> and <a onclick='window.open(\"http://http://github.com/flams/CouchDB-emily-tools\", \"_system\");'>couchdb-emily-tools</a>. Check them out and if you are up for it help us make them even better.",
        "investhelp": "We have plenty of ideas to expand the Ideafy service and we are constantly looking for funding opportunities. If you are interested, want to find out about our future and be part of it please contact us.",
        "toc" : "Table of contents",
        "backtotop": "Back to top",
        "choosepolling": "Poll new public ideas",
        "everymin": "Every minute",
        "everyfive": "Every 5 minutes",
        "everyfifteen": "Every 15 minutes",
        "never": "Disabled",
        "nointernet": "Your device is not connected: please check your Internet access and try again.",
        "schedmaintenance" : "Scheduled maintenance",
        "nextmaintenance" : "The next maintenance will take place on : ",
        "startnewmub": "Start a new session",
        "joinmub": "Join a session",
        "selectmode": "Select mode",
        "roulette": "Roulette",
        "campfire": "Campfire",
        "boardroom": "Boardroom",
        "rouletteinfo": "Any other Ideafyer may join this session",
        "campfireinfo": "Anyone from your contact list may join this session (no notification)",
        "boardroominfo": "Invitation only: invited contacts are notified and may join this session",
        "clear": "Clear",
        "create": "Create",
        "nofriendtoinvite": "No contact to invite: please add contacts to your list or select an other mode",
        "inviteatleastone": "You must select at least one contact to invite",
        "providesessioninfo": "You must enter a meaningful title and description",
        "sendinginvites": "Sending invitations...",
        "invitesent": "Invitations sent",
        "INVObject": " invited you to an Ideafy session",
        "nolongerjoin": "You can no longer join this session : it is already underway or completed.",
        "clicktojoin": "Push the button below to join session.",
        "selectsession": "Select a session",
        "participantleave": "Are you sure you want to leave? You will not be able to re-join nor will you get credited for any outcome  of the session",
        "leaderleave": "Are you sure you want to cancel this session? This will end it for all participants.",
        "waitingroomlbl": "Waiting room",
        "joinedsession": "<i>You joined this session.</i>",
        "deletingsession": "Deleting session : ",
        "participants": "Participants",
        "startbutton": "Start",
        "noresult": "No result found",
        "clicktoview": "Press the button below or visit your library to view"
},
                        lang : "en-us",
                        labels : new Store({})        
                        });
                };
        
        // init
        this.reset();
        
        return _config;
});
