const e=[{version:"1.5.3",date:"2026-07-28",platforms:["iOS","macOS"],notes:`Bug Fixes

- complete image network requests
- honor forced appearance settings
- preserve edited text nodes
- stabilize network request capture
- stabilize virtual table scrolling

Features

- add clear controls to filters
- add console command completion`},{version:"1.5.2",date:"2026-04-01",platforms:["iOS","macOS"],notes:`Bug Fixes

- Blob XHR response parsing error
- Transparent images cannot be distinguished from the background
- When the requested URLs are the same, the response size and time are incorrect`},{version:"1.5.1",date:"2026-03-25",platforms:["iOS","macOS"],notes:`Bug Fixes

- Addressing issues with overcrowded display of deep DOM tree nodes and scrolling view jumping
- Custom sizing in the simulator does not work when resizing or reloading
- Error loading next page in JSON format
- line-height should not be inherited
- Tables or table child elements cannot be edited
- The extension version number has not been updated
- Unable to inspect pop-up layer DOM
- When expanding child nodes, the element tree should maintain a complete row display`},{version:"1.5.0",date:"2026-03-14",platforms:["iOS","macOS"],notes:`Bug Fixes

- Emulator environment verification error
- Incorrect pixel text in the simulator
- Pseudo-node content parsing error
- The emulator may experience display overflow when scrolling the page
- The key path of the array child element is incorrectly encoded
- The new window that opens from the simulator is the wrong size
- The simulator should not be displayed when the window is opened from the simulator itself
- The simulator type should be saved persistently
- Use the Shadow DOM isolation simulator

Features

- Add a backup method when the emulator fails to open
- Add a console main program to the emulator
- Add a new icon for the device simulator
- Add an exit button to the device simulator
- Added device simulator functionality, supporting custom sizes
- Continue to save the simulator state when the page reloads`},{version:"1.4.7",date:"2026-01-30",platforms:["iOS","macOS"],notes:`Features

- Supports 37 languages`},{version:"1.4.6",date:"2026-01-08",platforms:["iOS","macOS"],notes:`Bug Fixes

- The box model border color is incorrect in light mode
- The CSS styles are not ordered correctly
- The group checkbox's hover color is incorrect
- Unable to combine DOM elements in console message

Features

- Add an icon to the "Copy Object"
- Display more inherited style properties in computed properties
- Supports DOM structure and styles for pseudo-elements

Performance Improvements

- Use pagination to preview large files (>800k)`},{version:"1.4.5",date:"2025-12-18",platforms:["iOS","macOS"],notes:`Bug Fixes

- Some object key resolution errors are appearing in the console panel
- The non-empty object is not displayed correctly in the console
- The window size is incorrect when re-entering after resizing`},{version:"1.4.4",date:"2025-12-15",platforms:["iOS","macOS"],notes:`Bug Fixes

- Console code lines misaligned
- The main window may disappear when you move it

Features

- Add main panel reset in pop-up window
- Supports displaying expanded objects in short names

Bug Fixes

- Console code lines misaligned
- Incorrect line breaks in style attributes during editing
- Request duration less than zero

Features

- Improve the style of the style properties panel`},{version:"1.4.2",date:"2025-12-04",platforms:["iOS","macOS"],notes:`Bug Fixes

- Constructor properties should not be copied
- FormData request details show an error
- Hidden element display status incorrect
- Unable to use the inspect function to locate reopened elements`},{version:"1.4.1",date:"2025-11-21",platforms:["iOS","macOS"],notes:`Bug Fixes

- PromiseRejectionEvent parses crashes in the console`},{version:"1.4.0",date:"2025-11-14",platforms:["iOS","macOS"],notes:`### Bug Fixes

- The console printouts are not parsing the correct style 
- The function type in the main environment is displayed incorrectly 
- The source code executed in the console is displayed incorrectly 

### Features

- Supports automatic switching to a sandbox environment when code execution fails in the main environment 
- Supports displaying document objects in the console 
- Supports displaying recursive objects in the console 
- Supports executing code in the main environment via the console 
- Supports viewing DOM objects in the console 
- Use simple object names instead of detailed information in second-level object values 

### Performance Improvements

- Add lazy loading to the element tree 

### Bug Fixes

- Added error messages indicating that some cross-domain code could not be loaded 
- DOM CSS styles are not displayed correctly when switching elements 
- Issue with DOM edit boxes displaying abnormally when they have no content 
- Parsing deep objects may cause the console to crash 
- Style overwrite calculation error 

### Features

- Add object code style to the console 
- Add object constructor name to the console 
- Adding resource loading error message display 
- Improved DOM editing style 
- Supports editing annotation style attributes 

### Bug Fixes

- Some logs in the main container are showing errors 
- The measurement box still exists even after the DOM has been removed 

### Bug Fixes

- Locating the DOM in the console sometimes doesn't work 
- The DOM tree should not be selected in the console 
- The error message "Copy failed" cannot be displayed 
- The parsing of elements without closing tags is incorrect 

### Features

- Add autofocus functionality when the console is activated 
- Improve DOM inspection and location capabilities on mobile devices 
- Improved the display of output results when executing code in the console 
- Support disabling page zoom settings 
- Supports assigning any execution result set to a global variable in the console. 
- Supports displaying DOM nodes in the console and setting them as global variables 
- Supports displaying objects in the console 
- Supports locating elements in the console and element tree`},{version:"1.3.0",date:"2025-11-11",platforms:["iOS","macOS"],notes:`Bug Fixes

- Child nodes were removed when editing a DOM node
- Page bounce issue when switching DOM elements
- The element tree cannot be scrolled when displaying detailed information
- The style property being edited is not updated when the focus is lost

Features

- Add basic DOM style property editing functionality
- Add DOM style editing checkboxes and override functionality
- Add editing/deleting/updating operations for inline styles
- Added DOM output node editing function
- Save the inspected element node to a console variable
- Supports DOM tree node deletion operations`},{version:"1.2.9",date:"2025-10-29",platforms:["iOS","macOS"],notes:`Improvements
- Improved pop-up window layout style`},{version:"1.2.8",date:"2025-10-20",platforms:["iOS","macOS"],notes:`Bug Fixes

- The image source type may be incorrect
- The input control will automatically capitalize when typing`},{version:"1.2.7",date:"2025-08-14",platforms:["iOS","macOS"],notes:`Bug Fixes

- Saving user configuration may cause refresh cache crash`},{version:"1.2.6",date:"2025-08-12",platforms:["iOS","macOS"],notes:`Bug Fixes

- Registered events are not destroyed on shutdown
- Should be not close when clearing storage
- Storage list displayed incorrectly when clearing
- Storage list is not updated when using delete/clear storage API
- Storage list not refreshed when deleting items`},{version:"1.2.4",date:"2025-06-16",platforms:["iOS","macOS"],notes:`Bug Fixes

- Element styles are overlaid and ordered incorrectly
- Element tree close tag is not displayed correctly when opening details
- Text selection is not disabled when dragging the main element`},{version:"1.2.3",date:"2025-06-13",platforms:["iOS","macOS"],notes:`Features

- Add an element node inspector and show its location in the DOM tree 
- Add basic DOM tree display function 
- Add DOM tree node selection function 
- Add DOM tree style properties and computed property details 
- Add element node positioning and display box model 
- Save the interface settings of the element details panel 
- Support automatic positioning of element information box 
- Support dynamic update of element frame positioning 
- Support for showing applied CSS properties 
- Support to display css var color 
- Support html code style 

Bug Fixes

- Check buttons cannot toggle to selector when window resize 
- Dom box model mini-width incorrect 
- DOM tree node detail styling is incorrect on mobile devices 
- DOM tree should not be updated when attributes change 
- Element box model border radius is not displayed 
- Element inspector should ignore console frames 
- Element properties update slowly when using throttle 
- Element tree closing tag not showing 
- Global config "Size" cannot be saved 
- Menu creation and registration script errors not caught 
- Screen rulers overlap each other 
- Selected node is incorrect when the node changes 
- The box model arrow style in the upper right corner is incorrect 
- The element box model is not deleted when the pointer leaves 
- Inspect element interactions on mobile that conflict with touchmove/pointerdown events 
- Inspector icon incorrect on mobile 
- The default console panel is incorrect 
- Hide document custom properties 
- Inline element frame size is incorrect 
- Sometimes the inspector cannot locate the element 
- Copy object state name is too long 

Performance Improvements

- Automatically display the frame information of element nodes outside the view 
- Improve element attribute calculation efficiency 
- Improve element box model style 
- Improve element box model style 
- Improved display element box model and screen ruler 
- Show details only when dom is open`},{version:"1.1.2",date:"2025-05-21",platforms:["iOS","macOS"],notes:`Features

- Added basic source tree with keyword/category filter support
- Added current line source tree highlighting
- Added source tree icon
- Added source tree details preview
- Read source map from source file
- Support "Open in Source" in network panel
- Support switching between multiple files in bundle file source map
- Support preview text line
- Support error details in file, line and column format
- Support more beautiful script/CSS code formatter

Improvements

- Improved preview text search interaction
- Code font family uses "Menlo, monospaced"
- Support mini layout for small screen main panel

Bug fixes

- Clear request list errors
- Code errors are not removed when switching to other files
- Console details cannot be switched
- Document source code is incorrect
- Path name ending with "/" is incorrect
- Error line/column position is incorrect during code formatting
- Prevent switching when clicking on position other than icon
- Incorrect root document path
- Incorrect source tree icon when currently active
- Source map parsing error when response is empty source
- Unable to capture request when XHR rewrites
- CSS source map parsing incorrectly
- Incorrectly formatted code when including HTML tags
- Incorrect toggling when bundle contains multiple source files
- Select/button controls toggle incorrectly when parent container is resized
- Button padding is misaligned on small screens
- Button text overflows on small screens`},{version:"1.0.6",date:"2025-05-09",platforms:["iOS","macOS"],notes:`Bug Fixes

- Module script request not caught 
- Only update if the new value is the same 
- Preview response text style is incorrect 
- Request name not decoded 
- Request pathname format incorrect 
- Request time to fixed incorrect 
- Request URL is not normalized 
- Table content not updated when switching panels 
- The line wrapping interface for log messages is broken`},{version:"1.0.5",date:"2025-04-23",platforms:["iOS","macOS"],notes:`Bug Fixes

- Asynchronous insertion of CSS can cause some problems 
- Causes window to close after clearing local storage 
- Click events don't stop when dragging an element 
- Copy object button id error 
- Copying objects does not work in multi-level nodes 
- Displaying the copy object button conflicts with JSONTree 
- Duplicate copy object button, handle conflict with extension JSONTree 
- Enabling copy objects in multiple subpaths may fail 
- Extension request self not ignore 
- Filter header is misaligned in diff tab panel 
- Improve copy notify styles 
- Incorrect icon size 
- Incorrect virtual scrolling when appending new data 
- Local configuration is not synchronized between multiple pages of the same origin 
- Preview json search background color incorrect in dark/light mode 
- Preview JSON short name concatenation does not work in multi-level objects 
- Request ID duplicates when getting source code in diff world 
- Select/Button control styles are different on iOS and Mac 
- Sometimes "unsafe-inline" sources fail to apply stylesheets 
- Sometimes the window cannot be moved 
- Splitting static resources between iOS and macOS 
- Tree node collapse only click marker 
- Unable to expand objects in console list 
- Update request data cannot scroll to bottom 
- Use click events instead of pointerup 
- Virtual scrolling exception when row data changes 

Features

- Add "Copy Object" in the right-click menu of preview json 
- Add base global config layout 
- Add global configuration for appearance/size 
- Add network list Double click to directly access URL 
- Keep network keywords when refreshing 

Performance Improvements

- Improve json short name preview`},{version:"1.0.3",date:"2025-04-10",platforms:["iOS","macOS"],notes:`### Bug Fixes

- Table does not scroll on mobile devices
- Camel case headers keys
- Cloning larger data may slow things down
- html details arrow icon not centered
- Improve all scrollbar width styles
- improve preview text styles
- Preview json empty string does not render
- Request details headers are not aligned with the list
- Some text Blob not parsed
- Sometimes xhr request does not respond
- The 'unhandledrejection' event was not caught

### Features

- New app icons
- Added preview text search
- Support for resizing the console window on mobile devices
- Support resizing of the Network Details and Storage Details windows on mobile devices
- Support window/panel size recording

### Performance Improvements

- Improve json previewer multi-instance performance
- Reduce page length to improve preview json performance
- Table cell values are too large, causing switching to be slow`},{version:"1.0.2",date:"2025-04-10",platforms:["iOS"],notes:`### Bug Fixes

- Camel case headers keys
- Cloning larger data may slow things down
- html details arrow icon not centered
- Improve all scrollbar width styles
- improve preview text styles
- Preview json empty string does not render
- Request details headers are not aligned with the list
- Some text Blob not parsed
- Sometimes xhr request does not respond
- The 'unhandledrejection' event was not caught

### Features

- Added preview text search
- Support for resizing the console window on mobile devices
- Support resizing of the Network Details and Storage Details windows on mobile devices
- Support window/panel size recording

### Performance Improvements

- Improve json previewer multi-instance performance
- Reduce page length to improve preview json performance
- Table cell values are too large, causing switching to be slow`},{version:"1.0",date:"2025-04-03",platforms:["iOS","macOS"],notes:""}];export{e as _};
