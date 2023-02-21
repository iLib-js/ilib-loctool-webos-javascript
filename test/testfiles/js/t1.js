var fs = require("foobar");

var t1 = function() {
    console.log("If you find this, you found the wrong string!");
}

t1.prototype.tester = function() {
    RB.getString("This is a test");
    rb.getString("This is a test1");
    rb.getString("This is a test with a unique id", "id1");
    $L("This is a test with getString Wrapper");
    $L("Go to  'Settings > General > Channels > Channel Tuning & Settings > Transponder Edit' and add one.")
};
createButtonOnPage(webappResBundle.getString("EXIT APP"), "ExitApp_Button", dir_head, onExitApp);
createButtonOnPage(webappResBundle.getString("RETRY"), "Retry_Button", dir_tail, onRetryApp);
createButtonOnPage(webappResBundle.getString("NETWORK SETTINGS"), "NetworkSetting_Button", dir_tail, onLaunchNetworkSetting);
createButtonOnPage(webappResBundle.getString("SETTINGS"), "Setting_Button", dir_tail, onLaunchGeneralSetting);