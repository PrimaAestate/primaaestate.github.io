const e=[{version:"1.2.8",date:"2026-10-13",platforms:["iOS","macOS"],notes:`Bug Fixes

- Per-site settings now apply correctly inside embedded frames
- Old per-site settings no longer limit "Enable all websites"
- Allowed CAPTCHA images keep the page's original layout`},{version:"1.2.7",date:"2026-10-08",platforms:["iOS","macOS"],notes:`Features

- Enable all websites is on by default for new installs
- Built-in Captcha Allowlist keeps CAPTCHAs working (reCAPTCHA, hCaptcha, Turnstile, GeeTest and more); edit it in the popup
- QR code login now works on WeChat, QQ and WeCom
- Images are hidden before the page first appears, reducing flashes (Safari 26+)

Bug Fixes

- Turning off Enable all websites could still block images on every site
- Enabling all websites after resetting a per-site toggle did not block images`},{version:"1.2.6",date:"2026-04-02",platforms:["iOS","macOS"],notes:`Improvements

- Improve request rules by using the source domain instead of the request domain`},{version:"1.2.5",date:"2026-03-25",platforms:["iOS","macOS"],notes:`Bug Fixes

- The images in the pseudo-elements were not blocked`},{version:"1.2.4",date:"2026-03-24",platforms:["iOS","macOS"],notes:`Bug Fixes

- The background service should be executed dynamically
- The extension version number has not been updated`},{version:"1.2.3",date:"2026-01-28",platforms:["iOS","macOS"],notes:`Features

- Supports 37 languages`},{version:"1.2.2",date:"2026-01-19",platforms:["iOS","macOS"],notes:`Bug Fixes

- Multilingual error on mobile devices

Features

- Add multilingual support to the main application
- Refactor the main application using native Swift
- Supports 20+ languages`},{version:"1.1.18",date:"2025-12-16",platforms:["iOS","macOS"],notes:""},{version:"1.1.17",date:"2025-10-29",platforms:["iOS","macOS"],notes:`Improvements
- Improved pop-up window layout style`},{version:"1.1.15",date:"2025-05-27",platforms:["iOS","macOS"],notes:`Improvements
- Improved popup window style
- Improved popup window title
- Removed console log`},{version:"1.1.13",date:"2025-02-17",platforms:["iOS","macOS"],notes:`Fixed:
- Extension version and description display incorrect`},{version:"1.1.12",date:"2025-01-09",platforms:["iOS","macOS"],notes:`Improvements:
- All application icons
- Dark/Light mode styles`},{version:"1.1.10",date:"2025-01-05",platforms:["iOS","macOS"],notes:`Improvements:
- Compress scripts to improve execution efficiency`},{version:"1.1.9",date:"2024-11-11",platforms:["iOS","macOS"],notes:"Fixed: unblocking in subdomain has no effect"},{version:"1.1.7",date:"2024-11-01",platforms:["iOS","macOS"],notes:`- Change popup information
- And feedback entry`},{version:"1.1.6",date:"2024-10-30",platforms:["iOS","macOS"],notes:"- Fixed global disabling will affect the current"},{version:"1.1.5",date:"2024-10-29",platforms:["iOS","macOS"],notes:`- Fixed current/global option conflict issue
- Fixed current check changes not reloading the page issue`},{version:"1.1.4",date:"2024-09-27",platforms:["iOS","macOS"],notes:""},{version:"1.1.3",date:"2024-09-23",platforms:["iOS","macOS"],notes:""},{version:"1.1.2",date:"2024-09-22",platforms:["iOS","macOS"],notes:"Updated application name and description."},{version:"1.1.1",date:"2024-09-17",platforms:["iOS","macOS"],notes:`- Fixed icon path error
- Fixed issue with subpages not working
- Improved styling`},{version:"1.0",date:"2024-09-13",platforms:["macOS"],notes:""}];export{e as _};
