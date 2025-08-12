# History

## v2.1.1 at 2025-08-12

The technical part

* Rewrite all JavaScript code in TypeScript
* Replace the storage from Vuex to Pinia
* Upgrade NodeJS to version 22
* Update dependencies


## v1.6.7 at 2025-01-26

What has been done

* Add disable cells
* Optimize UI for mobile devices
* Save map state on close tab
* Toggle menu on mobile version

Technical part

* Compress static pages
* Compress assets


## v1.6.6 at 2024-12-25

What has been done

* Change map translate by mouse
* Add background image to map

Technical part

* Refactoring: rename rewards
* Add consumable icons to documentation
* Disable scroll on mouse wheel

Fix errors

* Fix: unique id for reward
* Fix: translate map by keyboard


## v1.6.5 at 2024-12-04

What has been done

* Use keyboard on island map
* To offset a map use left mouse button
* Reset map scale and translate state by server
* Hide regions buttons if it is one

Technical part

* Update the dependencies
* Update docker


## v1.6.4 at 2024-11-09

What has been done

* Add cells loading by regions
* Add second move: wood
* Add filter warning state on island page
* Add start at time to regions numbers
* Add some icons
* Show the game version when syncing cells
* Add admin message near a feedback

Technical part

* Migrate eslint to flat config
* Refactoring: change user node ids state
* Refactoring: change table items component
* Remove the sentry dependency
* Update dependencies
* Update docker
* Add test for news page
* Update the home tests
* Optimize the news request
* Optimize the islands request
* Update static site generation

Fix bugs

* Fix: page not found in news
* Fix: change page title on locale switch


## v1.5.1 at 2024-09-09

What has been done

* Add news


## v1.4.1 at 2024-08-30

What has been done

* Add island parts on home page
* Add download the island in PNG format
* Add cell information dialog
* Some UI changes
* Add warning cells
* Add to filter only visible on map reward types

Technical part

* Refactoring: rename parameters
* Refactoring: create steps component
* Refactoring: show quantity button
* Format code

Fix bugs

* Fix: find nearest node on two start nodes
* Fix: get mouse position on mousedown


## v1.4.0

What has been done

* Add blocker nodes
* Change scale and translate values
* Remove node user comments
* Remove node update dialog
* Remove aсtive node frame

Technical part

* Add simple hero wars documentation
* Update dependencies


## v1.3.6

What has been done

* Add plan and going mode on select nodes
* Add select all nodes checkbox


## v1.3.5

What has been done

* Add feedback list
* Add filter for tower and chest
* Optimize map loading by cache
* Save scale, translate, user nodes for each island

Technical part

* Add vitest!
* Add status pages, help, about, home and contact simple tests
* Test some functions
* Add code coverage
* Refactoring: divide a hero client
* Format the code
* Update readme
* Change robots.txt


## v1.3.1-beta

What has been done

* Add server side rendering
* Add island description
* Add language for page not found

Technical part

* Migrate from vue-cli to vite
* Change swagger links
* Change dialog component
* Remove linter warning
* Update docker

Fix bugs

* Fix translate text


## v1.2.5-beta

What has been done

* Add full screen mode for map
* Localize data from server
* Reload page when change language
* Improve max scale
* Add API page

Technical part

* Add swagger
* Optimize node data size in API for 30 percent

Fix bugs

* Fix: render relative date
* Fix: empty name on filter
* Fix: translate on map


## v1.2.4-beta

What has been done

* Add two languages


## v1.1.28-beta

Add new pages

* main
* island
* contact
* about
* help
