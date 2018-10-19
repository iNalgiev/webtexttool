![Webtexttool](/resources/images/banner.png)

# Webtexttool for Craft CMS 2.x

Webtexttool is the easiest way to make your website content SEO proof, resulting in higher search engine rankings and more traffic to your website. With webtexttool everyone can create great content and make sure it's SEO proof at the same time.

We've put the knowledge and expertise of many many SEO experts in our SEO suggestions engine and made it very easy to use. You don't need to be an SEO expert yourself!

What you can do with the webtexttool plugin:

### Realtime optimization suggestions
The webtexttool plugin integrates with the Craft CMS editor. While writing your content, you will see realtime suggestions on how to improve your content. The suggestions will show directly alongside the editor, so they are clearly visible and easy to follow.

### Analysis of your content
Webtexttool will analyze your content and tell you how to optimize it for maximum results in search engine rankings.

### Keyword analysis & research
Webtexttool will help you find the best keywords for your content. Fill in your keyword to have it analyzed on volume and competition in realtime and also get suggestions on other keywords you could use.

### Text Conversion Optimizer / Content Quality
This module analyses your content and gives you tips to increase the readability of your text and improve the chances of conversion. Check our [video](https://youtu.be/5NZ6IjHntIQ) to find out more about this module!

### Uptodate SEO rules
We make sure that the webtexttool engine is always uptodate with the latest SEO rules. So you will always have access to the latest SEO rules and insights to optimize your content

### Page Rank & SEO optimization tracking
Webtexttool has a built in Page Rank and SEO optimization tracker. It will track the rank in Google of your content and SEO optimization score, so you can follow progress. It will notify you when rankings change.

Webtexttool can be used alongside other popular SEO plugins.

## Installation & Usage

Clone this repo into `craft/plugins/webtexttool`.

1. Activate the webtexttool plugin from the **Plugins** menu in Craft.
2. Webtexttool will now appear in your Craft dashboard [on the left] (make sure you have admin rights).
3. Click on webtexttool and login using your webtexttool credentials. If you don't have an account, you can create one for free [here](https://app.webtexttool.com/#/register-free). You can also use the API key. Overwrite the config file `wttApiKey` variable to add the API key.

### Meta Description Usage

Replace or modify your current SEO head code with, or to match, the following:

```twig
<!-- Webtexttool Meta Description -->

{% if entry is defined %}
{% set wttRecord = craft.webtexttool.getRecordByEntryId(entry.id) %}

{% if wttRecord is not null %}
        
<meta name="description" content="{{ wttRecord ? wttRecord.wttDescription : null }}" />

<meta property='og:url' content='{{ craft.request.url }}' />
<meta property='og:description' content='{{ wttRecord ? wttRecord.wttDescription : null }}' />

<meta property='twitter:site' content='{# Your Twitter Handle (no @) #}' />
<meta property='twitter:description' content='{{ wttRecord ? wttRecord.wttDescription : null }}' />
<meta property='twitter:url' content='{{ craft.request.url }}' />

<link rel="home" href="{{ siteUrl }}" />
<link rel="canonical" href="{{ craft.request.url }}">

{% endif %}

{% endif %}

<!-- / Webtexttool Meta Description -->
```

## FAQ

### Is webtexttool for Craft CMS free?
Yes, it’s free. The plugin is free. To use it you will need a free webtexttool account. With a free account you will have access to realtime SEO suggestions and Keyword analysis & research. You will have at least 10 keyword analysis credits per month. If you would need more than that, you could consider upgrading your webtexttool account.

### Do you have a Pro / paid version?
Yes, we have. We offer different subscriptions (Personal, Business, Enterprise). Read more on our [website](https://www.webtexttool.com/pricing). The main difference with the free webtexttool account, is that you will get more keyword analysis credits.

### Do you offer support?
Yes, of course! If you have any questions, please don’t hesitate to [contact us](https://www.webtexttool.com/about-webtexttool/contact/). We love to hear from you and will try to solve any issues asap.

## Changelog

### 1.2.4
- Added new language level support for Readabilty in Content Quality module
- Page slideout directive has been updated

### 1.2.3
- Fixed possible issue with single quotes in the meta description field 

### 1.2.2
- Added new category for Sentiment score + settings
- Updated Gender rule check: add setting for Neutral
- Added resources for Sentiment category
- Changed base API url
- Fixed CSRF token issue with AJAX Post requests

### 1.2.1
- Fixed TypeError: Cannot read property 'replace' of undefined
- Scoped CSS selectors to webtexttool
- Added escape function to meta description

### 1.2.0
- Added Text Conversion Optimizer module
    - Updated record & model
    - Added database migration
- Added option to insert or select optional synonyms
- Added toastr warnings and notifications
- Updated the way templates/directives are loaded
- Fixed saving records before recordId exits
- Fixed a few small bugs

### 1.1.2
- Fixed preview url not working with inactive entries

### 1.1.1
- Removed loadingTemplate causing issues

### 1.1.0
- Added config file (Use the config file to add the API key)
- Removed Beta ribbon
- Removed unnecessary JS files
- Added domain url to suggestions
- Fixed database column type (not enough characters)
- Fixed a few other bugs

### 1.0.1
- Prevent jquery conflicts. Craft comes with it's own version of jquery.

### 1.0.0
- Initial Release

---

Copyright © 2017 Webtexttool <info@webtexttool.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---
*This is the Craft 2.x version, for the Craft 3.x version see [link](https://github.com/iNalgiev/craft-webtexttool)*.
