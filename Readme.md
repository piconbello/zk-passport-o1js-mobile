# zk-passport-o1js

# TODO
- [] Write Readme
- [] Implement NFC Scanner
- [] Implement MRZ Scanner
- [] Implement Async Storage
- [] Implement Encrypted Storage
- [] Implement UI
    - [] Implement Passport Info Page
        - [] Implement Scan MRZ Page
        - [] Implement Scan NFC Page
        - [] Implement Password Lock Page
        - [] Implement Unlock Password Page
        - [] Implement log secure (dont log on production but only in dev mode) for passport data etc.
    - [] Implement Proof Generation Page
    - [] Implement Previous Proofs Page
        - [] Implement filterable/sortable page view (requested, proved, etc. and date)
        - [] Useful to share chain view link if available (SDK might provide metadata about where the proof was used)
        - [] Proof details popup/page
        
    - [] Implement Help Button
    - [] Implement Tutorial Carousel
- [] Implement deep linking
- [] Implement SDK Communication
    - [] Create a node.js process
    - [] Announce bonjour service
    - [] Start a socket io server


# Notes
Heavily inspired by [zk-passport](https://github.com/zk-passport/openpassport) project.


# Used Toolchains

#### expo
Main react native modules, package, bundle manager, etc.

#### gluestack-v2
Awesome UI Library, something like a hybrid of nativewind (tailwind) and nativebase

#### react-native-nfc-manager
Check if device has nfc capabilities

#### react-native-passport-reader
Passport reader for android only

#### NFCPassportReader
Passport reader for ios (native module)
* We inspected PassportReader.swift wrapper from OpenPassport along with the native passport reader module.
* Important note is that the new version of NFCPassportReader started using secure logs, but OpenPassport logs them in the console along with some direct prints in the wrapper, might be exposing them to device system log.
* We use a forked version of NFCPassportReader including changes from OpenPassport team to expose some data as public.
* Note to self: Take special care not to log these data in production, and always save in secure context.

#### nodejs-mobile-react-native
Used to spawn a node process to create a server on local network

#### @homebridge/ciao
Used to announce server via bonjour service

#### socket.io server
Used for communication via browsers in local network.