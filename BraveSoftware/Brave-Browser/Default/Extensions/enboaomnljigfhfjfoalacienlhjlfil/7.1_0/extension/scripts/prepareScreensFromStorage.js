// MARK: - Main Screen

// Generate Settings

function expandNeccessarySection() {
 getCurrentTab().then((tabs) => {
     const currentUrl = tabs[0].url;
     
     if (currentUrl.includes(shortsPageUrlPart)) {
         queryById("mainScreen").setAttribute("displayingCategoryId", "shortsPage");
     } else if (currentUrl.includes(searchPageUrlPart)) {
         queryById("mainScreen").setAttribute("displayingCategoryId", "searchPage");
     } else if (currentUrl.includes(videoPageUrlPart)) {
         queryById("mainScreen").setAttribute("displayingCategoryId", "videoPage");
     } else if (currentUrl.includes(subscriptionsPageUrlPart)) {
         queryById("mainScreen").setAttribute("displayingCategoryId", "subscriptionsPage");
     } else if (currentUrl.includes(channelPageUrlPart1) || currentUrl.includes(channelPageUrlPart2)) {
         queryById("mainScreen").setAttribute("displayingCategoryId", "channelPage");
     } else if (currentUrl.includes(youPageUrlPart1) || currentUrl.includes(youPageUrlPart2)) {
         queryById("mainScreen").setAttribute("displayingCategoryId", "youPage");
     } else {
         queryById("mainScreen").setAttribute("displayingCategoryId", "homePage");
     }
     
 })
}

function createOption(optionObject) {
    const optionName = getLocalizedOptionName(optionObject.name);
    const optionId = optionObject.id;
    const optionDefaultValue = optionObject.defaultValue;
    
    const optionParentWrapper = document.createElement("div");
    optionParentWrapper.classList.add("optionParentWrapper");
        
        const optionWrapper = document.createElement("div");
        optionWrapper.classList.add("optionWrapper");
            
            // Wrap with label so can activate by click on name
            
            var label;
    
            if (optionObject.type === "color") {
                label = document.createElement("div");
            } else {
                label = document.createElement("label");
            }
            
            label.className = "label";
            label.setAttribute("for", optionId);
                
                // Create option name
                
                const labelSpan = document.createElement("span");
                labelSpan.className = "labelSpan";
                labelSpan.innerHTML = optionName;
                
                // Control Element
                
                let controlElement;
                
                if (optionObject.type === "checkbox") {
                    
                    const switchLabel = document.createElement("label");
                    switchLabel.classList.add("switchLabel");
                    switchLabel.classList.add("switch");
    
                    const checkboxInput = document.createElement("input");
                    checkboxInput.className = "formCheckbox";
                    checkboxInput.id = optionId;
                    checkboxInput.setAttribute("type", "checkbox");
                    browser.storage.local.get(optionId, function (obj) {
                        const value = obj[optionId] ?? optionDefaultValue;
                        checkboxInput.checked = value;
                    });
                    
                    const slider = document.createElement("span");
                    slider.classList.add("slider", "round");
    
                    switchLabel.appendChild(checkboxInput);
                    switchLabel.appendChild(slider);
                    
                    controlElement = switchLabel;
                    
                } else if (optionObject.type === "select") {
                    
                    const selectContainer = document.createElement("div");
                    selectContainer.classList.add("selectContainer");
                    
                    const chevron = document.createElement("i");
                    chevron.classList.add("fa-solid");
                    chevron.classList.add("fa-caret-down");
                    
                    const select = document.createElement("select");
                    select.classList.add("selectSelect");
                    select.id = optionObject.id;
                    
                    browser.storage.local.get(optionId, function (obj) {
                        const selectValue = obj[optionId] ?? optionDefaultValue;
        
                        for (const selectOption of optionObject.selects) {
                            var opt = document.createElement('option');
                            opt.value = selectOption.id;
                            opt.innerHTML = getLocalizedOptionName(selectOption.name);
                            if (selectOption.id == selectValue) {
                                opt.setAttribute("selected", "");
                            }
                            select.appendChild(opt);
                        }
                    });
                    
                    selectContainer.appendChild(select);
                    selectContainer.appendChild(chevron);
                    
                    controlElement = selectContainer;
                    
                } else if (optionObject.type === "color") {
                    
                    const colorPickerWrapper = document.createElement("div");
                    colorPickerWrapper.className = "colorPickerWrapper";
                    
                    const colorPickerInput = document.createElement("input");
                    colorPickerInput.setAttribute("type", "color");
                    colorPickerInput.id = optionId;
                    
                    const clearButton = document.createElement("i");
                    clearButton.classList.add("fa-solid", "fa-xmark", "resetColorInput");
                    
                    browser.storage.local.get([optionId], function (obj) {
                        const selectValue = obj[optionId] ?? "default";
                        
                        if (selectValue != "default") {
                            colorPickerInput.setAttribute("value", selectValue);
                        }
                    });
                    
                    colorPickerWrapper.appendChild(colorPickerInput);
                    colorPickerWrapper.appendChild(clearButton);
        
                    controlElement = colorPickerWrapper;
                    
                } else {
                    
                    controlElement = document.createElement("div");
                    
                }
            
            label.appendChild(labelSpan);
            label.appendChild(controlElement);
                
        optionWrapper.appendChild(label);
    
    optionParentWrapper.appendChild(optionWrapper);
    
    // Recursively handle childOffOptions
    
    if (optionObject.hasOwnProperty('childOffOptions')) {
        const childOptionsWrapper = document.createElement("div");
        childOptionsWrapper.classList.add("childOptionsWrapper");
        childOptionsWrapper.classList.add("childOffOptions");

        for (const childOption of optionObject.childOffOptions) {
            const childOptionWrapper = createOption(childOption);
            childOptionsWrapper.appendChild(childOptionWrapper);
        }
        
        optionParentWrapper.appendChild(childOptionsWrapper);
    }
    
    if (optionObject.hasOwnProperty('childOnOptions')) {
        const childOptionsWrapper = document.createElement("div");
        childOptionsWrapper.classList.add("childOptionsWrapper");
        childOptionsWrapper.classList.add("childOnOptions");

        for (const childOption of optionObject.childOnOptions) {
            const childOptionWrapper = createOption(childOption);
            childOptionsWrapper.appendChild(childOptionWrapper);
        }
        
        optionParentWrapper.appendChild(childOptionsWrapper);
    }
    
    return optionParentWrapper;
}


function generateSettingsController(inputCategories, isSearch) {
 
 getCurrentTab().then((tabs) => {
     if (!isSearch) {
         const currentUrl = tabs[0].url;
         
         if (ACTUAL_CATEGORIES.length == 0) {
             prepareActualSetting(currentUrl);
         }
     }
     
     // Clean for case when user changing lang
     
     queryById("activeCategoryButtonList").innerHTML = "";
     queryById("categoryPickerList").innerHTML = "";
     queryById("settingsContainerSearch").innerHTML = "";
     queryById("settingsContainerDefault").innerHTML = "";
     
     for (const category of inputCategories) {
         
         const categoryName = getLocalizedCategoryName(category.categoryName);
         
         if (!isSearch) {
             
             // Category Picker List
             
             const newCategory = document.createElement("div");
             newCategory.innerHTML = categoryName;
             newCategory.classList.add("category");
             newCategory.setAttribute("categoryId", category.categoryId);
             queryById("categoryPickerList").appendChild(newCategory);
             
             // Category Picked
             
             const newCategory2 = document.createElement("div");
             newCategory2.innerHTML = categoryName;
             newCategory2.classList.add("pickedCategory");
             newCategory2.setAttribute("categoryId", category.categoryId);
             queryById("activeCategoryButtonList").appendChild(newCategory2);
         }
         
         // Fill Options
         
         const categoryGroups = category.categoryGroups;
         const categoryId = category.categoryId;
         
         if (categoryGroups.length == 0) { continue; }
         
         // Create Section
         
         const collapsibleSection = document.createElement("div");
         collapsibleSection.className = "collapsibleSection";
         collapsibleSection.setAttribute("categoryId", categoryId);
         
         if (isSearch) {
             const collapsibleSectionTitle = document.createElement("div");
             collapsibleSectionTitle.className = "collapsibleSectionTitle";
             collapsibleSectionTitle.innerHTML = categoryName;
             collapsibleSection.appendChild(collapsibleSectionTitle);
         }
         
         for (const group of categoryGroups) {
             
             const groupObject = group;
             const groupOptions = groupObject.options;
             
             if (groupOptions.length == 0) { continue; }
             
             // Create Group
             
             const collapsibleSectionBody = document.createElement("div");
             collapsibleSectionBody.className = "settingsGroup";
             
             if ((isSearch) || (categoryGroups.length > 1)) {
                 
                 // Add Label for group
                 
                 const groupTitleWrapper = document.createElement("div");
                 groupTitleWrapper.classList.add("optionsGroupTitle");
                 groupTitleWrapper.innerHTML = getLocalizedGroupName(groupObject.groupName);
                 
                 collapsibleSectionBody.appendChild(groupTitleWrapper);
             }
             
             // Create Group Body
             
             const settingsGroupBody = document.createElement("div");
             settingsGroupBody.className = "settingsGroupBody";
             
             collapsibleSectionBody.appendChild(settingsGroupBody);
             
             for (const option in groupOptions) {
                 
                 // Create Option Parent Wrapper
                 
                 const optionWrapper = createOption(groupOptions[option]);
                 
                 settingsGroupBody.appendChild(optionWrapper);
             }
             
             collapsibleSection.appendChild(collapsibleSectionBody);
             
         }
         
         if (isSearch) {
             queryById("settingsContainerSearch").appendChild(collapsibleSection);
         } else {
             queryById("settingsContainerDefault").appendChild(collapsibleSection);
         }
     }
     
     if (!isSearch) {
         expandNeccessarySection();
     }
     
     
     // MARK: - Changge Category
     
     const categoriesButtons = querySelectorAll("#categoryPickerList .category");
     
     for (const category of categoriesButtons) {
         category.onclick = function() {
             queryById("mainScreen").setAttribute("displayingCategoryId", category.getAttribute("categoryId"));
             queryById("mainScreen").setAttribute("categorypickerisshowing", false);
             
             // Trigger a scroll to the top to remove the previously scrolled content from the old category.
             var scrollableDiv = document.getElementById("settingsContainer");
             scrollableDiv.scrollTop = 0;
         }
     }
     
     // MARK: - Checkbox Click
     
     const checkboxes = document.querySelectorAll("#mainScreen .optionWrapper:not(:has(.colorPickerWrapper))");
     
     for (const checkbox of checkboxes) {
         
         checkbox.onclick = function() {
             event.preventDefault();
             
             const hiddenInput = checkbox.querySelector('.formCheckbox');
             const checkboxId = hiddenInput.id;
             
             browser.storage.local.get(checkboxId, function (obj) {
                 const defaultValue = findOptionById(checkboxId).defaultValue;
                
                 // Check if exist
                 if (defaultValue != null) {
                     const status = obj[checkboxId] ?? defaultValue;
                     hiddenInput.checked = status ? false : true
                     
                     setToStorage(checkboxId, !status);
                     
                     sendCommand(checkboxId);
                 }
             })
         }
     }
     
     // MARK: - Select Option Change
     
     const selects = document.querySelectorAll("#mainScreen .selectSelect");
     
     for (const select of selects) {
         
         select.onchange = function() {
             setToStorage(select.id, select.value);
             sendCommand(select.id, select.value);
         }
     }
     
     // Click on row with select
     
     const itemsWithSelect = querySelectorAll("#mainScreen .optionWrapper:has(select)");
     
     for (const index in itemsWithSelect) {
         const item = itemsWithSelect[index];
         item.onclick = function() {
             showDropdown(item.querySelector("select"));
         }
     }
     
     // MARK: - Color Picker Changed
     
     const itemsWithColorPicker = querySelectorAll("#mainScreen .optionWrapper input[type='color']");
     
     for (const colorPicker of itemsWithColorPicker) {
         colorPicker.oninput = function () {
             colorPicker.setAttribute("value", colorPicker.value);
             setToStorage(colorPicker.id, colorPicker.value, function() {
                 sendCommand(colorPicker.id);
             });
         }
     }
     
     // Click on reset button
     
     const clearColorPickerArray = querySelectorAll("#mainScreen .optionWrapper .resetColorInput");
     
     console.log(clearColorPickerArray);
     for (const clearColorPicker of clearColorPickerArray) {
         clearColorPicker.onclick = function () {
             const colorPicker = clearColorPicker.parentNode.querySelector("input");
             colorPicker.value = "#000";
             colorPicker.removeAttribute("value");
             setToStorage(colorPicker.id, "default", function() {
                 sendCommand(colorPicker.id);
             });
         }
     }
     
 })
}

// MARK: - Account Manage Screen

// Set email and password

function setEmailPasswordFromStorage() {
    browser.storage.local.get([getConstNotSyncing.pro_usernameData,
                               getConstNotSyncing.pro_passwordData], function (obj) {
        const username = obj[getConstNotSyncing.pro_usernameData] ?? "";
        const password = obj[getConstNotSyncing.pro_passwordData] ?? "";
        
        queryById("accountManageEmail").value = username;
        queryById("accountManagePassword").value = password;
    })
}

setEmailPasswordFromStorage();
 
// MARK: - More Screen

// Set extension theme
 
function setExtensionTheme() {
    browser.storage.local.get(getConstNotSyncing.extensionThemeData, function (obj) {
        const data = obj[getConstNotSyncing.extensionThemeData] ?? "auto";

        queryById("extensionThemeSelect").value = data;
        document.documentElement.setAttribute("theme", data);
    })
}

setExtensionTheme();

// Set iCloud Syncing

function setIcloudSyncing() {
    browser.storage.local.get(getConstNotSyncing.isCloudSyncingData, function (obj) {
        const data = obj[getConstNotSyncing.isCloudSyncingData] ?? "off";
        
        queryById("iCloudSyncingSelect").value = data;
    })
}

setIcloudSyncing();

// Set My Other Apps Block showing

function setMyOtherAppsShowing() {
    browser.storage.local.get(getConst.myOtherAppsData, function (obj) {
        const data = obj[getConst.myOtherAppsData] ?? "showing";
        
        queryById("myOtherAppsSelect").value = data;
        document.documentElement.setAttribute("myOtherApps", data);
    })
}

setMyOtherAppsShowing();

// Set Login State

function setLoginState() {
    browser.storage.local.get(getConstNotSyncing.pro_usernameData, function (obj) {
        const data = obj[getConstNotSyncing.pro_usernameData] ?? "";
        
        if (data != "") {
            queryById("userLoginEmail").innerHTML = data;
            document.documentElement.setAttribute("isLogin", "true");
            app_isLogin = "true";
        }
    })
}

setLoginState();


// MARK: - Password Locking Screen

// Set buttons states

function setButtonStates() {
    browser.storage.local.get([getConst.passwordLockingIsActiveData,
                               getConst.passwordLockingPasswordData,
                               getConst.passwordLockingPromptData], function (obj) {
        
        const passwordLockingIsActive = obj[getConst.passwordLockingIsActiveData];
        const passwordLockingPassword = obj[getConst.passwordLockingPasswordData];
        const passwordLockingPrompt = obj[getConst.passwordLockingPromptData];
        
        if (passwordLockingIsActive == true) {
            queryById("passwordProtectionStatusInfo").setAttribute("active", "");
            
            queryById("protectPasswordTextField").value = passwordLockingPassword;
            queryById("protectPassword2TextField").value = passwordLockingPassword;
            queryById("passwordPromptTextField").value = passwordLockingPrompt;
            
            queryById("passwordLocking-bottomButtons").setAttribute("active", "");
        }
    })
}

setButtonStates();

// Reset
function password_generateDurationsList() {
    browser.storage.local.get(getConst.passwordLockingResetPeriodData, function (obj) {
        
        const selected = obj[getConst.passwordLockingResetPeriodData] ?? 0;
        
        const durationSelect = queryById("passwordResetPeriodSelect");
        
        // Clear old
        
        durationSelect.innerHTML = "";
        
        for (resetVariant of resetDurationVariants) {
            const option = document.createElement("option");
            option.value = resetVariant.id;
            option.innerHTML = resetVariant.label[app_language];
            
            if (resetVariant.id == selected) {
                option.selected = true;
            }
            
            durationSelect.appendChild(option);
        }
    })
}

// MARK: - Password Reset Screen

browser.storage.local.get([getConst.passwordLockingResetPeriodData], function (obj) {
    const passwordLockingResetPeriod = obj[getConst.passwordLockingResetPeriodData] ?? 0;
    
    if (passwordLockingResetPeriod != 0) {
        const foundObject = resetDurationVariants.find(obj => obj.id == passwordLockingResetPeriod);
        
        if (foundObject) {
            queryById("resetPeriodDisplayLabel").innerHTML = foundObject.label;
            
            // Get the current date
            const currentDate = new Date();
            
            // Amount of time to add in minutes
            const minutesToAdd = foundObject.amountInMin;
            
            // Calculate the new date by adding minutes
            const newDate = new Date(currentDate.getTime() + minutesToAdd * 60000);
            
            // Format the new date
            const formattedDate = newDate.toLocaleString();
            
            // Set Formatted Date
            queryById("resetDateDisplayLabel").innerHTML = formattedDate;
        }
    }
})

// MARK: - Password Unlocking Screen

// Show buttons if can

browser.storage.local.get([getConst.passwordLockingPromptData,
                           getConst.passwordLockingResetPeriodData,
                           getConst.passwordLockingResetFinalDateData,
                           getConst.passwordLockingResetIsActiveData], function (obj) {
    
    const currentDate = new Date();
    
    const passwordLockingPrompt = obj[getConst.passwordLockingPromptData] ?? "";
    const passwordLockingResetPeriod = obj[getConst.passwordLockingResetPeriodData] ?? 0;
    const passwordLockingResetFinalDate = obj[getConst.passwordLockingResetFinalDateData] ?? currentDate;
    const passwordLockingResetIsActive = obj[getConst.passwordLockingResetIsActiveData] ?? false;
    
    if (passwordLockingPrompt != "") {
        queryById("passwordUnlockingShowPromptButton").style.display = "block";
    }
    
    if (passwordLockingResetPeriod != 0) {
        
        const normalPasswordLockingResetFinalDate = new Date(passwordLockingResetFinalDate);
        
        if (passwordLockingResetIsActive) {
            if (currentDate < normalPasswordLockingResetFinalDate) {
                queryById("passwordUnlockingResetDateDisplaying").style.display = "block";
                queryById("passwordUnlockingResetDateDisplaying").innerHTML = "Password Reset Date: " + normalPasswordLockingResetFinalDate.toLocaleString();
            }
        } else {
            queryById("passwordUnlockingResetPasswordButton").style.display = "block";
        }
    }
})


// MARK: - Shortcuts Screen

// Set shortcut

function setShortcut() {
    browser.storage.local.get(getConst.shortcuts[0], function (obj) {
        const data = obj[getConst.shortcuts[0]] ?? null;
        
        if (data != null) {
            queryById("setHotkeyButton").innerHTML = data.join("+").toUpperCase();
            querySelector(".hotKeyWrapper").classList.add("setted");
        }
    })
}

// MARK: - YouTube Blocking Schedule Screen

// Generate Time Select Options

function generateTimeSelectOptions() {
    function getTimeRanges(interval, language = window.navigator.language) {
        const ranges = [];
        const date = new Date();
        const format = {
        hour: 'numeric',
        minute: 'numeric',
        };
        
        for (let minutes = 0; minutes < 24 * 60; minutes = minutes + interval) {
            date.setHours(0);
            date.setMinutes(minutes);
            ranges.push(date.toLocaleTimeString(language, format));
        }
        
        return ranges;
    }
    
    const timeRange = getTimeRanges(10, 'ru');
    const timeRangeLength = timeRange.length;
    
    const appSelects = document.querySelectorAll("#youtubeBlockingScheduleScreen .timeSelectField");
    
    for (const select of appSelects) {
        for (var i = 0; i < timeRangeLength; i++) {
            const option = document.createElement("option");
            option.innerHTML = timeRange[i];
            option.value = timeRange[i];
            select.appendChild(option);
        }
    }
}

generateTimeSelectOptions();

// Generate Days

function generateDays() {
    
    const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    function translateWeekday(weekdayString) {
      const weekdayIndex = WEEKDAYS.indexOf(weekdayString.toLowerCase())
      if (weekdayIndex < 0) throw new Error(`Unknown weekday "${weekdayString}"`)

      const dummyDate = new Date(2001, 0, weekdayIndex)

      return dummyDate.toLocaleDateString(app_language, { weekday: 'short' })
    }
    
    // Clear old
    
    queryById("scheduleDaysWrapper").innerHTML = "";
    
    // Set Days
    
    for (const day in WEEKDAYS) {
        const dayName = translateWeekday(WEEKDAYS[day]);
        const dayID = DAYS[day];
        
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("scheduleDay", "active");
        dayDiv.setAttribute("day-id", dayID);
        dayDiv.innerHTML = dayName;
        queryById("scheduleDaysWrapper").appendChild(dayDiv);
        
        dayDiv.onclick = function() {
            if (this.classList.contains("active")) {
                this.classList.remove("active")
            } else {
                this.classList.add("active")
            }
        }
    }
}

// Set block the extension checkbox

function scheduledBlocking_getExtensionBlockStatus() {
    browser.storage.local.get(getConst.youtubeBlockingScheduleBlockExtensionData, function (obj) {
        const data = obj[getConst.youtubeBlockingScheduleBlockExtensionData] ?? false;
        
        const button = queryById("youtubeBlockingScheduleBlockExtensionCheckbox");
        
        if (button) {
            button.checked = data;
        }
    })
}

scheduledBlocking_getExtensionBlockStatus();

// Set second interval status

function getSecondIntervalStatus() {
    browser.storage.local.get(getConst.youtubeBlockingScheduleTimeIntervalsData, function (obj) {
        const data = obj[getConst.youtubeBlockingScheduleTimeIntervalsData] ?? [];
        
        if (data.length > 1) {
            queryById("additionalIntervalRow").style.display = "flex";
            queryById("addAdditionalInterval").style.display = "none";
        }
    })
}

getSecondIntervalStatus();

// Set intervals times

function getIntervalsTimes() {
    browser.storage.local.get(getConst.youtubeBlockingScheduleTimeIntervalsData, function (obj) {
        const data = obj[getConst.youtubeBlockingScheduleTimeIntervalsData] ?? [];
        
        if (data.length > 0) {
            queryById("scheduleTimesFirstSelectFrom").value = data[0].from;
            queryById("scheduleTimesFirstSelectTo").value = data[0].to;
            
            if (data.length > 1) {
                queryById("scheduleTimesSecondSelectFrom").value = data[1].from;
                queryById("scheduleTimesSecondSelectTo").value = data[1].to;
            }
        }
    })
}

getIntervalsTimes();

// Set days

function getDays() {
    browser.storage.local.get(getConst.youtubeBlockingScheduleDaysData, function (obj) {
        const data = obj[getConst.youtubeBlockingScheduleDaysData] ?? [];
        if (data.length > 0) {
            
            const daysButtons = document.querySelectorAll("#scheduleDaysWrapper .scheduleDay");
            
            for (var i = 0; i < daysButtons.length; i++) {
                const dayButton = daysButtons[i];
                if (data.includes(dayButton.getAttribute("day-id"))) {
                    dayButton.classList.add("active");
                } else {
                    dayButton.classList.remove("active");
                }
            }
        }
    })
}

getDays();

// Set schedule buttons states

function getScheduleButtonsStatus() {
    browser.storage.local.get(getConst.youtubeBlockingScheduleIsActiveData, function (obj) {
        const data = obj[getConst.youtubeBlockingScheduleIsActiveData] ?? false;
        
        if (data == true) {
            queryById("youtubeBlockingSchedule-bottomButtons").setAttribute("active", "");
        }
    })
}

getScheduleButtonsStatus();


// MARK: - YouTube Blocking Temporary Screen

// Set block the extension checkbox

function temporaryBlocking_getExtensionBlockStatus() {
    browser.storage.local.get(getConst.youtubeBlockingTemporaryBlockExtensionData, function (obj) {
        const data = obj[getConst.youtubeBlockingTemporaryBlockExtensionData] ?? false;
        
        const button = queryById("youtubeBlockingTemporaryBlockExtensionCheckbox");
        
        if (button) {
            button.checked = data;
        }
    })
}

temporaryBlocking_getExtensionBlockStatus();

// Generate durations

function temporaryBlocking_generateDurationsList() {
    
    // Set block duration
    browser.storage.local.get(getConst.youtubeBlockingTemporaryDurationData, function (obj) {
        
        const selected = obj[getConst.youtubeBlockingTemporaryDurationData] ?? 300;
        
        const durationSelect = queryById("temporaryBlockingDuration");
        
        const countBy5Min = 288;
        var currentSeconds = 300; // 5 min
        
        for (var i = 0; i < countBy5Min; i++) {
            const option = document.createElement("option");
            option.value = currentSeconds;
            
            const minValue = currentSeconds / 60;
            
            const objectToDisplay = minValue;
            
            var displayString = minValue;
            
            if (currentSeconds == selected) {
                option.selected = true;
            }
            
            option.innerHTML = displayString;
            
            durationSelect.appendChild(option);
            currentSeconds += 300;
        }
    })
}

temporaryBlocking_generateDurationsList();

// Set schedule buttons states

function getTemporaryButtonsStatus() {
    browser.storage.local.get(getConst.youtubeBlockingTemporaryIsActiveData, function (obj) {
        const data = obj[getConst.youtubeBlockingTemporaryIsActiveData] ?? false;
        
        if (data == true) {
            queryById("youtubeBlockingTemporary-bottomButtons").setAttribute("active", "");
        }
    })
}

getTemporaryButtonsStatus();

// MARK: - Opening Timer Screen

// Generate
function generateDurationsList() {
    browser.storage.local.get([getConst.openingTimerValueData,
                               getConst.openingTimerIsActiveData], function (obj) {
        
        const openingTimerIsActive = obj[getConst.openingTimerIsActiveData];
        
        const selected = obj[getConst.openingTimerValueData] ?? 1;
        
        const durationSelect = queryById("openingTimerDurationSelect");
        
        const max = 601;
        
        for (var i = 1; i < max; i++) {
            const option = document.createElement("option");
            option.value = i;
            
            var displayString = ""
            
            displayString += i;
            
            if (i == selected) {
                option.selected = true;
                
                if (openingTimerIsActive == true) {
                    queryById("launchDelayState").setAttribute("active", "");
                }
            }
            
            option.innerHTML = displayString;
            
            durationSelect.appendChild(option);
        }
        
        if (openingTimerIsActive == true) {
            queryById("openingTimer-bottomButtons").setAttribute("active", "");
        }
    })
}

generateDurationsList();

// Set Message

function getMessage() {
    browser.storage.local.get(getConst.openingTimerMessageData, function (obj) {
        
        const message = obj[getConst.openingTimerMessageData] ?? "";
        
        if (message != "") {
            queryById("openingTimerMessage").value = message;
        }
    })
}

getMessage();

// MARK: - Browser Specific Things

function setBrowserBasedLinks() {
    
    // Rate Link

    const rateLink = document.querySelector('.dynamic-rate-link');

    if (rateLink) {
        if (app_browser == "safari") {
            rateLink.setAttribute("href", "https://apps.apple.com/us/app/untrap-for-youtube/id1637438059");
        } else if (app_browser == "firefox") {
            rateLink.setAttribute("href", "https://addons.mozilla.org/ru/firefox/addon/untrap-for-youtube/");
        } else if (app_browser == "edge") {
            rateLink.setAttribute("href", "https://microsoftedge.microsoft.com/addons/detail/untrap-for-youtube/ngnefladcohhmmibccafkdbcijjoppdo");
        } else {
            rateLink.setAttribute("href", "https://chromewebstore.google.com/detail/enboaomnljigfhfjfoalacienlhjlfil");
        }
    }
    
    // SocialFocus Link
    
    const socialFocusLink = document.querySelector('.dynamic-socialfocus-link');
    
    if (socialFocusLink) {
        if (app_browser == "safari") {
            socialFocusLink.setAttribute("href", "https://apps.apple.com/us/app/socialfocus-hide-distractions/id1661093205");
        } else if (app_browser == "firefox") {
            socialFocusLink.setAttribute("href", "https://addons.mozilla.org/en-US/firefox/addon/socialfocus/");
        } else if (app_browser == "edge") {
            socialFocusLink.setAttribute("href", "https://microsoftedge.microsoft.com/addons/detail/socialfocus-hide-distrac/dkkbdagpdnmdakbbchbicnfcoifbdlfc");
        } else {
            socialFocusLink.setAttribute("href", "https://chromewebstore.google.com/detail/socialfocus-hide-distract/abocjojdmemdpiffeadpdnicnlhcndcg");
        }
    }
}

// MARK: - More Screen

// Set Scheduled Info

function setYoutubeScheduledBlockingStatusInfo() {
    browser.storage.local.get([getConst.youtubeBlockingScheduleIsActiveData],
                              function (obj) {
        
        const scheduleIsActive = obj[getConst.youtubeBlockingScheduleIsActiveData];
        
        if (scheduleIsActive == true) {
            queryById("youtubeScheduleBlockingStatusInfo").setAttribute("active", "");
        } else {
            queryById("youtubeScheduleBlockingStatusInfo").removeAttribute("active", "");
        }
    })
}

setYoutubeScheduledBlockingStatusInfo();

// Set Temporary Info

function setYoutubeTemporaryBlockingStatusInfo() {
    browser.storage.local.get([getConst.youtubeBlockingTemporaryIsActiveData],
                              function (obj) {
        
        const temporaryIsActive = obj[getConst.youtubeBlockingTemporaryIsActiveData];
        
        if (temporaryIsActive == true) {
            queryById("youtubeFocusBlockingStatusInfo").setAttribute("active", "");
        } else {
            queryById("youtubeFocusBlockingStatusInfo").removeAttribute("active", "");
        }
    })
}

setYoutubeTemporaryBlockingStatusInfo();

// MARK: - Content Filter Screen

// Set channels & videos filter status

function getFiltersStatus() {
    
    var totalRules = 0;
    
    browser.storage.local.get([getConst.filterChannelsRulesData,
                               getConst.filterVideosRulesData,
                               getConst.filterCommentsRulesData,
                               getConst.filterPostsRulesData], function (obj) {
        
        const channelsRulesCount = (obj[getConst.filterChannelsRulesData] ?? []).length;
        const videosRulesCount = (obj[getConst.filterVideosRulesData] ?? []).length;
        const commentsRulesCount = (obj[getConst.filterCommentsRulesData] ?? []).length;
        const postsRulesCount = (obj[getConst.filterPostsRulesData] ?? []).length;
        
        totalRules += channelsRulesCount + videosRulesCount + commentsRulesCount + postsRulesCount;

        if (totalRules > 0) {
            queryById("channelsVideosFilterCounter").setAttribute("active", "");
            document.querySelector("#channelsVideosFilterCounter .activeSpan").innerHTML = totalRules;
        } else {
            queryById("channelsVideosFilterCounter").removeAttribute("active", "");
        }
    })
}

getFiltersStatus();

// Set add filter buttons to context menu

function getContentFilterBlockStatus() {
    browser.storage.local.get(getConst.blocklistContextMenuButtonsData, function (obj) {
        const data = obj[getConst.blocklistContextMenuButtonsData] ?? false;
        
        const button = queryById("blocklistFilterContextButtons");
        
        button.checked = data;
    })
}

getContentFilterBlockStatus();

// Set enable filtration checkbox

function getIsFiltrationEnabled() {
    browser.storage.local.get(getConst.filterIsEnabledData, function (obj) {
        const data = obj[getConst.filterIsEnabledData] ?? false;
        
        const button = queryById("blocklistFilterEnableFilter");
        
        button.checked = data;
    })
}

getIsFiltrationEnabled();

// Set placeholder

function contentFilter_setPlaceholderOnLaunch() {
    
    const firstTab = document.querySelector(".firstContenFilterTab");

    if (firstTab) {
        document.getElementById("contentFilterField").setAttribute("placeholder", firstTab.getAttribute("data-input"));
    }
    
}
