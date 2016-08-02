This app packages Rocket.Chat 0.36.0

### Overview

A complete team chat solution, from group messages and video calls all the way to helpdesk killer features.

### Accounts

The app is preconfigured to use your Cloudron's `LDAP`. Simply add/remove users in the Cloudron Admin page
to manage Rocket.Chat users.

The first user to login becomes the Rocket.Chat `administrator`. This administrator can mark other
users as administators for the application. Please note that the Cloudron admin status is not carried
over to the Rocket.Chat automatically (This is expected to be fixed in a future version).

To enable external registration, go to `Administration` -> `Accounts` -> `Registration Form`. Choose `Public`.

<!--
Rocket.Chat requires unique email and user ids. In the case of conflict between a LDAP account and an
external account, Rocket.Chat chooses the account that was registered first.
-->

### Features
* **Video Conference**
    Chat with your colleagues and friends face-to-face over audio and video.
* **Helpdesk Chat**
    Have your website visitors contact you in real-time and increase conversions.
* **File Sharing**
    Drag-and-drop files or select them from your computer or mobile device.
* **Voice Messages**
    Record and transmit voice messages to a channel, group or private conversation.
* **Link Preview**
    Post a link and immediately view its content. YouTube, Twitter, Gifs!
* **API**
    Integrate your chat to multiple services: GitHub, GitLab, JIRA, Confluence and others.
* **Extendability**
    Want a new killing feature? Add a new package. It's as simple as that.
* **Native Applications**
    Native client applications available for download on Linux, Windows and OSX.
* **Mobile Applications**
    Mobile client applications available for iOS and Android on their respective stores.
