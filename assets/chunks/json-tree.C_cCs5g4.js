const e=[{version:"1.2.4",date:"2026-03-19",platforms:["iOS","macOS"],notes:`Features

- Added compatibility handling for sandbox CSP mode
- The "Copy Language Type" button is now optional`},{version:"1.2.3",date:"2026-01-30",platforms:["iOS","macOS"],notes:`Features

- Supports 37 languages`},{version:"1.2.2",date:"2026-01-21",platforms:["iOS","macOS"],notes:`Bug Fixes

- Fixed the issue of garbled characters when displaying special fonts
- The option label colors are incorrect`},{version:"1.2.1",date:"2026-01-12",platforms:["iOS","macOS"],notes:`Thank you to user "f" for the very helpful suggestion.

Bug Fixes

- The button theme is incorrect in light/dark mode

Features

- Supports hold down ⌥ or ⌘ to expand all child nodes`},{version:"1.2.0",date:"2026-01-12",platforms:["iOS","macOS"],notes:`Bug Fixes

- Copy type error at root node
- The copy button is not displayed correctly when hovering
- The default theme background color is incorrect

Features

- Supports exporting type declarations for languages ​​such as Java, TS, and Go
- Add value/type copy functionality to each object node`},{version:"1.1.3",date:"2025-12-16",platforms:["iOS","macOS"],notes:`Bug Fixes

- The button theme is not displayed correctly when using light mode
- The default theme should be set to automatic light/dark

Features

- Add "Copy Object" menu icon
- Improve popup layout styles`},{version:"1.1.2",date:"2025-10-29",platforms:["iOS","macOS"],notes:`Improvements
- Improved pop-up window layout style`},{version:"1.1.1",date:"2025-06-18",platforms:["iOS","macOS"],notes:`Features

- Supports multiple code themes for VSCode and Webstorm

Bug Fixes

- Default theme display incorrectly
- Incorrect button color in light mode
- Secondary text color is inconsistent
- Copy object state name is too long
- Hide document custom properties
- Repeated creation error on the right menu is not ignored`},{version:"1.0.14",date:"2025-04-22",platforms:["iOS","macOS"],notes:`Bug Fixes

- Content scripts may be executed repeatedly when using local files 
- Copied object is displayed only on Macintosh 
- Copy object does not work with URL ports 
- Copying objects may not work when switching pages 
- Display less text on mobile devices 
- Displaying the copy object button conflicts with ConsoleMini 
- Duplicate copy object button, handle conflict with extension ConsoleMini 
- Global function names may be repeated 
- Handle the visible state of the Copy Object button using the document URL pattern 
- manifest.json is missing the "menus" permission 
- Parsing fails when key path contains dot notation 
- Styles come later than scripts when using local files 

Improvements

- Improve array length display style 
- Improve copy notification style`},{version:"1.0.13",date:"2025-04-17",platforms:["iOS","macOS"],notes:`Bug Fixes

- Collapse/expand only when the marker is clicked
- Empty text parse error
- Incorrect arrow placeholder styles in Safari 18.3/18.4
- Remove unused test codes

Features

- Add object tree contextmenu button "Copy Object"
- Display array length
- Improve popup styles
- Update tips and Contact Us

Performance Improvements

- Highlight collapsed tree nodes and optimize performance issues for large data
- Improving initial execution conditions`},{version:"1.0.12",date:"2025-03-05",platforms:["iOS","macOS"],notes:`Fixed:
- Displaying incorrect html text value
- Selection text is abnormal when using flex`},{version:"1.0.11",date:"2025-02-17",platforms:["iOS","macOS"],notes:`Fixed:
- Extension version and description display incorrect`},{version:"1.0.10",date:"2025-01-20",platforms:["iOS","macOS"],notes:`Features:
- Support "file:///" location path
- Support right-click menu "Open with"
- Support drag and drop files
- Support shared files`},{version:"1.0.8",date:"2025-01-09",platforms:["iOS","macOS"],notes:`Improvements:
- All application icons`},{version:"1.0.7",date:"2025-01-09",platforms:["iOS","macOS"],notes:`Improvements:
- All application icons`},{version:"1.0.6",date:"2025-01-05",platforms:["iOS","macOS"],notes:`Fixed:
- Pagination button display status is incorrect

Improvements:
- Compress scripts to improve execution efficiency`},{version:"1.0.5",date:"2024-12-30",platforms:["iOS","macOS"],notes:`Features
- Support lazy loading of large JSON

Fixed
- Fix control button should not be selected`},{version:"1.0.4",date:"2024-12-09",platforms:["iOS","macOS"],notes:"- Add new feedback site"},{version:"1.0.3",date:"2024-11-01",platforms:["iOS","macOS"],notes:`- Add popup information
- Add feedback entry`},{version:"1.0.2",date:"2024-09-27",platforms:["iOS","macOS"],notes:"Updated deployment target to 11.5 Big Sur"},{version:"1.0.1",date:"2024-09-25",platforms:["macOS"],notes:`- Fixed Boolean value style
- Improve collapsed object style`},{version:"1.0",date:"2024-09-20",platforms:["macOS"],notes:""}];export{e as _};
