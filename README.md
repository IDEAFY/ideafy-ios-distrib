ideafy-ios-distrib
==================

A repo to archive distribution versions of Ideafy (past and in-development) for the app store


THINGS TO REMEMBER/CHECK WHEN BUILDING AN IOS VERSION
=====================================================

1. Check index.html
Header should include cordova library (minified)
Check css stylesheet --> newstyle-ios-min.css
(main difference in css file: 
- importbutton for camera or library pictures
- popup positioning and transitions
Check iframe should point to blank.html file on production server
2. Check css contents
3. Check wbimport.js and editprofile.js to make sure cordova's API is used (vs. input type=file)
4. Build ideafy for iOS
Verify content of build.js, target should be www-ios
5. Copy newstyle-ios-min.css, index.html and main.js to ideafy-ios to xcode project
6. run and test with xcode
7. if ok archive application
