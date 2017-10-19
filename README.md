# GodScraper

This is a Google Sheet and Google Script powered webpage scraper.

Steps to use:

1. Copy and paste the contents of godscraper.js into a Google Script for whatever Google Sheet you're working with.

2. Save it, run it once to grant your account permissions.

3. Reload your Google Sheet and a menu called "GodScraper" will appear.

4. Create a new sheet in your Google Sheet. Call it "GodScraper Settings."

5. Copy and paste the contents of settings.xlsx into the "GodScraper Settings" sheet you just created.

6. All of the settings and command references are in this document. There is example data already loaded if you want to test and experiment. 

-PAGE SCRAPE lists all the parameters for ripping basic text from a webpage. 
-CSV SCRAPE adds data from a remotely-hosted CSV.
-JSON SCRAPE transforms any JSON string into a Google Sheet.

7. Once you have everything setup, go to whatever sheet in the Google Sheet you want to dump data into.

8. Select any cell and click GodScraper > Page Scrape to grab specified text from a specific URL. If the target URL isn't generating data via AJAX and doesn't block XML imports, the requested information should dump into the cells.

9. Select any cell and click GodScraper > CSV Scrape to dump a CSV file into the sheet.

10. Select any cell and click GodScraper > JSON Scrape to transform a URL's JSON string into spreadsheet format.

Play around with syntax and commands if things don't work, and remember that some pages simply don't allow this to work. But most webpages with a traditionally-generated DOM should work just fine.

A note on cron jobs: this scraper has a chronTasks() function built-in that can be easily populated with tasks. Once you have your list of commands to carry out, schedule the intervals at which they are excuted in the Google Scripts > Resources > Current project triggers. Make certain cronTasks is selected under the "Run" option. The default cronTask function grabs data from a JSON file and pours it into a newly-created Sheet.

Got questions? Ask away. 

jeff.hargarten@startribune.com
http://freyhargarten.com