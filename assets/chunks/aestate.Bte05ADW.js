const e=[{version:"1.6.2",date:"2026-10-14",platforms:["iOS"],notes:`Bug Fixes

- More reliable DNS after network switches, sleep and outages, including IPv6 DNS servers.
- Temporarily skip failing DNS servers instead of sticking to one.`},{version:"1.6.1",date:"2026-09-29",platforms:["iOS","macOS"],notes:`Features

- Export application logs to make connection issues easier to diagnose.`},{version:"1.6.0",date:"2026-09-04",platforms:["iOS","macOS"],notes:`Bug Fixes

- Improve DNS resolution and failover on hotspot connections, network changes, unavailable local DNS ports, and intercepting resolvers

Performance Improvements

- Reduce DNS CPU wakeups, memory copies, and lock contention with one-shot timers and transaction-ID dispatch
- Reduce background UI polling, redraws, and log writes to lower idle energy use`},{version:"1.5.11",date:"2026-08-07",platforms:["iOS","macOS"],notes:`Bug Fixes

- Demote expected DNS remote-send errors to debug
- Graceful shutdown may be compromised
- Harden DNSRecorder caching and isolate unit tests
- Preserve completion for empty stream sends
- Reduce SwiftUI/shared-notification UI retain noise
- resolve Core Data UI refresh issues by enabling automaticallyMergesChangesFromParent and forcing refetch refresh
- Stabilize ConnectionRecorder counters and sampling
- Startup error with no logs

Performance Improvements

- Allow timer margin to reduce battery consumption`},{version:"1.5.10",date:"2026-07-05",platforms:["iOS","macOS"],notes:`Bug Fixes

- Connection dispatch frame error when switching to the next stream`},{version:"1.5.9",date:"2026-06-30",platforms:["iOS","macOS"],notes:`Bug Fixes

- The initial DNS record is not working

Bug Fixes

- The DNS address is not excluded in the route`},{version:"1.5.7",date:"2026-06-17",platforms:["iOS","macOS"],notes:`Performance Improvements

- Use DNS connection pooling to reduce frequent resource overhead

Bug Fixes

- Connection pool may cause crashes

Performance Improvements

- Optimize network connectivity and encoder stability and efficiency`},{version:"1.5.2",date:"2026-05-14",platforms:["iOS","macOS"],notes:`Bug Fixes

- A disconnected connection may be used, leading to socket errors
- When network changes occur, idle connections are not re-evaluated

Performance Improvements

- Use locks instead of queues and remove the statistics process from the main program to improve efficiency

Bug Fixes

- When the connection pool is empty, the timer is not canceled`},{version:"1.5.0",date:"2026-05-12",platforms:["iOS","macOS"],notes:`Bug Fixes

- When using local caching, the DNS connection is not automatically closed`},{version:"1.4.4",date:"2026-05-05",platforms:["iOS","macOS"],notes:`Bug Fixes

- The DNS HTTPS request did not exclude IPv6 addresses
- The refresh group may crash
- DNS cache invalidated after switching networks
- HTTPS DNS caching is invalid`},{version:"1.4.2",date:"2026-04-27",platforms:["iOS","macOS"],notes:`Bug Fixes

- No error message should be displayed after the connection is canceled

Performance Improvements

- Lazy load encoder

Bug Fixes

- A message read error will occur if the first packet receives a FIN
- Prevent the connection state update handler from triggering when the connection is canceled

Performance Improvements

- Cache the default header to reduce header encoding/decoding overhead`},{version:"1.4.0",date:"2026-04-19",platforms:["iOS","macOS"],notes:`### Bug Fixes

- EOF and FIN packets were sent incorrectly
- The share menu is displayed in the wrong location

### Bug Fixes

- Fixes a crash issue that could occur if log writes fail
- Repeat the end data packet when EOF is received
- Some base64 URI parsing errors occurred`},{version:"1.3.10",date:"2026-03-09",platforms:["iOS","macOS"],notes:`Bug Fixes

- The spacing of the details view layout in the old system was incorrect 

Bug Fixes

- Crash while clearing activity information 
- Menu bar tools lack translation 
- Some of the prompts were not translated 
- The blank content layout in the old system was not filled 

Bug Fixes

- Long-term connection abnormally disconnected (incorrect MTU) 

Features

- Application should terminate after last window closed 

Performance Improvements

- Quickly and gracefully close the dual-ended connection`},{version:"1.3.7",date:"2026-01-09",platforms:["iOS","macOS"],notes:`Features

- Supports 37 languages

Bug Fixes

- Fix service startup/shutdown order issue 
- The cancellation operation may be repeated when actively closing 
- When a connection error occurs, the bidirectional connection should be forcibly closed 

Performance Improvements

- Quickly start/stop services during network switching 

Performance Improvements

- Improve connection/read/write timeout configuration to reduce consumption 

Performance Improvements

- Optimize connection speed using TCP no-delay and fast-open 

Bug Fixes

- The connection should not be dropped when refreshing other groups`},{version:"1.2.28",date:"2026-01-09",platforms:["macOS"],notes:`Bug Fixes

- Compatible with more values ​​for the "allowInsecure" option`},{version:"1.2.25",date:"2025-12-25",platforms:["iOS","macOS"],notes:`This update primarily fixes layout and style issues in older system versions.

Bug Fixes

- Incorrect pop-up window size in older system versions
- Some icons cannot be displayed in older system versions
- Tabs and section color are not displayed correctly in older system versions

Bug Fixes

- Menu bar icons are not displayed correctly in light/dark mode
- Navigation titles are displayed incorrectly in older system versions
- The background is incorrect in light mode
- The background of the pop-up window is incorrect in light mode`},{version:"1.2.23",date:"2025-12-22",platforms:["iOS","macOS"],notes:`Bug Fixes

- In situations of network instability, DNS activity counts may repeat multiple times 
- Sometimes connection statistics are not cleared when the connection ends 
- Sometimes the connection is not broken when the network changes 

Bug Fixes

- Multiple DNS IP query results associated with the old cache may still exist 
- The word "Memery" is incorrect 

Performance Improvements

- Automatically clear unused DNS cache to save memory 
- Improve DNS caching structure to optimize memory usage 
- Use bin files to quickly save activity statistics 

Bug Fixes

- Excessive memory usage when network latency is high and unstable`},{version:"1.2.20",date:"2025-12-07",platforms:["iOS","macOS"],notes:`Bug Fixes

- Memory leaks may occur when the connection is closed`},{version:"1.2.19",date:"2025-12-05",platforms:["iOS","macOS"],notes:`Bug Fixes

- It may crash when the network disconnected`},{version:"1.2.17",date:"2025-11-29",platforms:["iOS","macOS"],notes:`Bug Fixes

- It may crash when the network reconnects`},{version:"1.2.15",date:"2025-11-21",platforms:["iOS","macOS"],notes:`Bug Fixes

- The menu bar does not start after device restart`},{version:"1.2.14",date:"2025-11-07",platforms:["iOS","macOS"],notes:`Features

- Add vibration feedback when updating services or settings`},{version:"1.2.13",date:"2025-11-04",platforms:["iOS","macOS"],notes:"Stability and performance improvements."},{version:"1.2.12",date:"2025-10-29",platforms:["iOS","macOS"],notes:`Bug Fixes

- Excluded routes cidr cannot be modified
- Switching too frequently when DNS queries are blocked
- The TCP connection sometimes fails to close gracefully upon disconnection`},{version:"1.2.11",date:"2025-07-25",platforms:["iOS"],notes:""},{version:"1.2.10",date:"2025-08-29",platforms:["macOS"],notes:""}];export{e as _};
