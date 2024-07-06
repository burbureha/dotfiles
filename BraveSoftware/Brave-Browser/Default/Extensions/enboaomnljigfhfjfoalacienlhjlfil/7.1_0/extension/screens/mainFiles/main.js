(function() {
    
    // MARK: - Category Picker
    
    queryById("activeCategoryButton").onclick = function() {
        var isShowing = queryById("mainScreen").getAttribute("categoryPickerIsShowing");
        queryById("mainScreen").setAttribute("categoryPickerIsShowing", isShowing == "false");
    }
    
    // MARK: - Router
    
    function showUnlockScreen() {
        queryById("unlockPasswordTextField").classList.remove("error");
        queryById("unlockPasswordTextField").value = "";
        queryById("wrongProtectionPasswordError").style.display = "none";
        showScreen("unlockScreen");
    }
    
    // MARK: - Power Button
    
    // Click
    
    queryById("powerButton").onclick = function() {
         browser.storage.local.get(getConstNotSyncing.extensionIsEnabledData, function (obj) {
             const globalDefault = true;
             const status = obj[getConstNotSyncing.extensionIsEnabledData] ?? globalDefault;
             
             document.documentElement.setAttribute("disabled", status == true);
             
             setToStorage(getConstNotSyncing.extensionIsEnabledData, !status);
             
             sendCommand(getConstNotSyncing.extensionIsEnabledData);
         })
    }
    
    // Set State
    
    const powerButton = queryById("powerButton");
    browser.storage.local.get(getConstNotSyncing.extensionIsEnabledData, function (obj) {
        const globalDefault = true;
        const status = obj[getConstNotSyncing.extensionIsEnabledData] ?? globalDefault;
        
        document.documentElement.setAttribute("disabled", status != true);
    });
    
    // MARK: - Search
    
    // Methods
    
    function findOptionsByQuery(searchQuery) {
        
        queryById("settingsContainerSearch").innerHTML = "";
        
        // Get all options
        
        const allOptions = getAllOptions(ACTUAL_CATEGORIES);
        
        // Leave only options that contains search terms
        
        const filteredOptions = searchOptions(allOptions, searchQuery);
        
        if (filteredOptions.length > 0) {
            // Recreate Cascade Array
            
            const recreatedActualCategory = recreateCascadeStructure(filteredOptions);
            
            // Show It Through function generateSettingsController
            
            generateSettingsController(recreatedActualCategory, true);
        } else {
            // Show nothing was found
            
            queryById("searchMessage").style.display = "block";
        }
    }
    
    function activateSearchMode(searchQuery) {
        queryById("mainScreen").setAttribute("search_mode", "");
        findOptionsByQuery(searchQuery);
    }
    
    function disableSearchMode() {
        queryById("mainScreen").removeAttribute("search_mode");
        queryById("searchField").value = "";
        queryById("settingsContainerSearch").innerHTML = "";
        queryById("searchMessage").style.display = "none";
        generateSettingsController(ACTUAL_CATEGORIES, false);
        
        var scrollableDiv = document.getElementById("settingsContainer");
        scrollableDiv.scrollTop = 0;
    }
    
    // Typed in SearchField
    
    let typingTimer; // Timer identifier
    const doneTypingInterval = 500; // Time in milliseconds (adjust as needed)
    
    queryById("searchField").onkeyup = function() {
        clearTimeout(typingTimer); // Clear the previous timer (if exists)
        
        const searchQuery = queryById("searchField").value;
        typingTimer = setTimeout(function() {
           queryById("searchMessage").style.display = "none";
           const searchQuery = queryById("searchField").value;
           if (searchQuery.length == 0) {
               disableSearchMode();
           } else {
               activateSearchMode(searchQuery);
           }
       }, doneTypingInterval);
    }
    
    // Clear SearchField
    
    queryById("clearSearch").onclick = function() {
        disableSearchMode();
    }

})();
 
