# Intercom

Source: https://www.intercom.com/help/en/articles/180-billing

Localize the Messenger to work with multiple languages | Intercom Help
Skip to main content
Search for articles...
Localize the Messenger to work with multiple languages
How to localize the Intercom Messenger for your product, website and/or mobile app and communicate with customers in their language.
Written by
Eric Fitzgerald
Updated this week
Table of contents
Supported languages
Arabic, Bengali, Bosnian, Brazilian Portuguese, Bulgarian, Catalan, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, German, German (Formal), Greek, Hebrew, Hindi, Hungarian, Indonesian, Italian, Japanese, Korean, Latvian, Lithuanian, Malay, Mongolian, Norwegian, Persian, Polish, Portuguese, Romanian, Russian, Serbian, Simplified Chinese, Slovenian, Spanish, Swahili, Swedish, Thai, Traditional Chinese, Turkish, Ukrainian, and Vietnamese.
Note:
Right-to-left languages are partially supported in our Mobile SDKs. To learn more have a chat with us in the Messenger.
Localize the Messenger
You can localize the Messenger for your product, website and/or mobile app with just a few clicks.
Go to
Settings > Channels > Messenger > General
and select
Choose supported languages
.
Then, add a language you want to support:
Now all of the UI language in the Messenger, such as
Send us a message
and your team intro will be localized in these additional languages to match your customer's device settings.
For example, even if your default language is English, the Messenger can appear in French to your French users, in German to your German users and so on.
If you'd like to set a new default language in your Messenger, click
Make default
next to a language you've added.
How the Messenger picks which language to show
Three pieces of content — the welcome message and team intro, the special notice, and the privacy policy notice — can each be configured per language. When the Messenger needs to display one of these, it picks the best available version in this order:
The customer's exact language and region (e.g. English (US))
The base language (e.g. English)
Your workspace's default language
The base of your workspace default language
This means customers on regional language settings e.g. English (UK), English (US) now see the closest translation you've set up, instead of nothing.
Tip:
You don't need to add a separate entry for every regional variant. Setting up the base language (e.g. English) covers customers on any regional variant of it e.g. English (US), English (UK). This only affects what customers see in the Messenger — your content settings are unchanged.
Send outbound messages to users in their language
Intercom auto-detects the language of your users using machine learning ("Detected language"), or from their browser settings ("Browser language"), which then gets stored as a user attribute.
Like any other attribute, you can use this to filter your
Contacts
according to language and then click
New message.
Or, you can create a
Proactive Support
message and use
Audience
rules to send to users based on language.
Tip:
Localize an existing Workflow or Proactive Support message by duplicating it via the
More
tab on the top right when editing. Then translate the content and change the browser language in the audience rules to reflect the language.
FAQs
How does localization work with Fin AI Agent?
After you've localized the Messenger for your supported languages, you can enable
Multilingual Fin
and provide customers with automated answers in multiple languages.
How does localization work with the Article Search card?
If you've localized your Messenger
and
your Help Center, content shown in the Article Search card will match your user's browser language. If you don't support your user's browser language, the default language of your Help Center will be shown.
How does localization work with Messenger apps?
At the moment, most Messenger apps are only supported in English.
Can I control the language of the in-app Messenger UI?
Yes, you can override this language by setting a user attribute called language_override.
Here is an article on the different ways in which you can set this attribute:
Enforce the language of the Messenger, Fin AI Agent and Workflows for specific users
.
Can I target mobile users by language?
When Intercom is loaded in your mobile app, the user's language is detected based on the language of the OS. The Messenger will load in the user's language if it is supported in your workspace. If your workspace doesn't support their language, the Messenger will load in your workspace's default language
Intercom
does not
automatically track mobile user's language in an attribute on their profile like we do for web. For user's loaded in the Messenger on the web, Intercom tracks their language in the "Browser language" attribute, which is
only applicable to web integrations
.
If you want to target outbound content at mobile users based on language, you will need to set up tracking yourself. You can either use the
language_override
attribute to track mobile user language, or create a custom attribute to track language.
Does the Shopify app automatically adapt the Messenger language to match the store's language?
No — the Shopify app doesn't automatically adapt the Messenger language to match the store's current language. To enable dynamic language switching, you'll need to add custom JavaScript that detects the site's active language and sets the
language_override
attribute in your Intercom settings.
Here's an example of how to do this:
var currentLanguage = document.documentElement.lang || 'en'; // Detect the page's language

window.intercomSettings = {
  app_id: '[YOUR WORKSPACE ID]',
  language_override: currentLanguage // Set the detected language
};
Note: Make sure all the languages your store supports are added in Settings > Channels > Messenger under Choose supported languages. If a language isn't configured there, the Messenger will fall back to your workspace's default language.
How is language detected in WhatsApp conversations?
When a new contact is created from WhatsApp, their language is determined based on their number prefix. If the language is supported by your workspace, this language will be set as the contact's Messenger and browser locale. Otherwise, your workspace's default language will be used.
Can I localize outside of the Messenger?
Yes, you can also configure your
Help Center
and
Fin AI Agent
to support multiple languages.
💡
Tip
Need more help?
Get support from our
Community Forum
Find answers and get help from Intercom Support and Community Experts
Related Articles
Support multiple languages in your Help Center
Style your Messenger to support multiple brands
Use Intercom in your preferred language
Automatic language detection in conversations
Enforce the language of the Messenger, Fin AI Agent and Workflows for specific users
Did this answer your question?
😞
😐
😃
Table of contents