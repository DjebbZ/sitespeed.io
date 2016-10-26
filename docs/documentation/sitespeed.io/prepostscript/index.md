---
layout: default
title: Pre/post scripts (log in the user)
description: You can login the user to test pages as a logged in user.
keywords: selenium, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Pre/post scripts (log in the user)
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Pre/post scripts

# Pre/post scripts and login the user
{:.no_toc}

* Lets place the TOC here
{:toc}

# Selenium
Before sitespeed.io loads and tests a URL you can run your own Selenium script. Maybe you want to access a URL and pre-load the cache or maybe you want to login as a user and then measure a URL.

We use the NodeJs version of Selenium, you can find the [API documentation here](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html).

## Login example
Create a script where you login the user. This is an example to login the user at Wikipedia. Create a file login.js with the following.

~~~ bash
module.exports = {
  run(context) {
    return context.runWithDriver((driver) => {
      // Go to Wikipedias login URL
      return driver.get('https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page')
        .then(() => {
          // You need to find the form, the login input fiels and the
          // password field. Just add you name and password and submit the form
          // For more docs, checkout the NodeJS Selenium version
          // http://seleniumhq.github.io/selenium/docs/api/javascript/index.html

          // we fetch the selenium webdriver from context
          var webdriver = context.webdriver;
          // before you start, make your username and password
          var userName = 'YOUR_USERNAME_HERE';
          var password = 'YOUR_PASSWORD_HERE';
          var loginForm = driver.findElement(webdriver.By.tagName('form'));
          var loginInput = driver.findElement(webdriver.By.id('wpName1'));
          loginInput.sendKeys(userName);
          var passwordInput = driver.findElement(webdriver.By.id('wpPassword1'));
          passwordInput.sendKeys(password);
          loginForm.submit();
        });
    })
  }
};
~~~

Make sure to change the username & password first
{: .note .note-warning}

Then run it like this:

~~~ bash
$ sitespeed.io --preScript login.js https://en.wikipedia.org/wiki/Barack_Obama
~~~

The script will then login the user and access https://en.wikipedia.org/wiki/Barack_Obama and measure that page.


Checkout the magic row:

~~~
var webdriver = context.webdriver;
~~~

From the context object you get a hold of the Selenium [Webdriver object](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html) that you can use to find elements on the page.

## Test a page with primed cache
One other thing you can do with a pre script is simulate a user that browsed a couple of pages and then measure the performance of a page (by default the cache is emptied when you use sitespeed.io).

Create a pre script (pre.js):

~~~ bash
module.exports = {
  run(context) {
    return context.runWithDriver((driver) => {
      // Go to the start page of sitespeed.io
      return driver.get('https://www.sitespeed.io/');
    });    
  }
};
~~~

And then run it like this:

~~~ bash
$ sitespeed.io --preScript pre.js -b chrome https://www.sitespeed.io/documentation/
~~~

The browser will then first access https://www.sitespeed.io/, fill the cache and then go to https://www.sitespeed.io/documentation/ where we will collect all the metrics.

Firefox (and/or the HAR Export trigger) has a bug that reports requests in the HAR file as 200 not flagging that they are from the local browser cache. Follow the [bug here](https://github.com/sitespeedio/browsertime/issues/121). We recommend you use Chrome until this is fixed.
{: .note .note-warning}