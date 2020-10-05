const Repository = require('../models/Repository');

module.exports = 
class BookmarksController extends require('./Controller') {
    constructor(req, res) {
        super(req, res);
        this.bookmarksRepository = new Repository('Bookmarks');
    }
    // GET: api/bookmarks
    // GET: api/bookmarks/{id}
    get(id) {
        let params = this.getQueryStringParams();
        // if there are no query parameters
        if(params === null) {
            // if the id is specified, return only the corresponding bookmark
            if(!isNaN(id))
                this.response.JSON(this.bookmarksRepository.get(id));
            // if there are no id specified, return all the bookmarks
            else
                this.response.JSON(this.bookmarksRepository.getAll());
        }
        // if we have no parameter, expose the list of possible query strings
        else if (Object.keys(params).length === 0) {
            this.help();
        }
        else {
            this.doService(params);
        }
    }
    doService(params) {
        var data = this.bookmarksRepository.getAll();
        var resultat = [];
        if('name' in params) {
            var name = params.name;
            var trimmedName;
            if(name.startsWith("*")) {
                if(name.endsWith("*")) {
                    trimmedName = name.substring(1, name.length - 1);
                    for(let i = 0; i < data.length; i++) {
                        if(data[i].Name.includes(trimmedName))
                            resultat.push(data[i]);
                    }
                }
                else {
                    trimmedName = name.substring(1, name.length);
                    for(let i = 0; i < data.length; i++) {
                        if(data[i].Name.endsWith(trimmedName))
                            resultat.push(data[i]);
                    }
                }
            }
            else if(name.endsWith("*")) {
                trimmedName = name.substring(0, name.length - 1);
                for(let i = 0; i < data.length; i++) {
                    if(data[i].Name.startsWith(trimmedName))
                        resultat.push(data[i]);
                }
            }
            else {
                for(let i = 0; i < data.length; i++) {
                    if(data[i].Name === name)
                        resultat.push(data[i]);
                }
            }
        }
        if('category' in params){
            var category = params.category;
            var trimmedCategory;
            if(category.startsWith("*")) {
                if(category.endsWith("*")) {
                    trimmedCategory = category.substring(1, category.length - 1);
                    for(let i = 0; i < data.length; i++) {
                        if(data[i].Category.includes(trimmedCategory))
                            if(!(resultat.includes(data[i])))
                                resultat.push(data[i]);
                    }
                }
                else {
                    trimmedCategory = category.substring(1, category.length);
                    for(let i = 0; i < data.length; i++) {
                        if(data[i].category.endsWith(trimmedCategory))
                            if(!(resultat.includes(data[i])))
                                resultat.push(data[i]);
                    }
                }
            }
            else if(category.endsWith("*")) {
                trimmedCategory = category.substring(0, category.length - 1);
                for(let i = 0; i < data.length; i++) {
                    if(data[i].Category.startsWith(trimmedCategory))
                        if(!(resultat.includes(data[i])))
                            resultat.push(data[i]);
                }
            }
            else {
                for(let i = 0; i < data.length; i++) {
                    if(data[i].Category === category)
                        if(!(resultat.includes(data[i])))
                            resultat.push(data[i]);
                }
            }
        }
        if('sort' in params){
            if(params.sort === 'name') {
                resultat.sort((a, b) => a.Name.localeCompare(b.Name));
            }
            else if(params.sort === 'category') {
                resultat.sort((a, b) => b.Category.localeCompare(a.Category));
                
            }
        }
        this.response.JSON(resultat);
    }
    help() {
        // expose all the possible query strings
        let content = "<div style=font-family:arial>";
        content += "<h3>GET : api/bookmarks endpoint  <br> List of possible query strings:</h3><hr>";
        content += "<h4>? sort = \"name\" <br>returns all bookmarks sorted by their name in ascending order";
        content += "<h4>? sort = \"category\" <br>returns all bookmarks sorted by their category in ascending order";
        content += "<h4>? name = \"NAME\"<br>returns the bookmark with the specified name";
        content += "<h4>? name = \"STRING*\"<br>returns the bookmark that starts with the specified string";
        this.res.writeHead(200, {'content-type':'text/html'});
        this.res.end(content) + "</div>";
    }
    invalidUrl(url) {
        let r = /^(ftp|http|https):\/\/[^ "]+$/;
        return !r.test(url);
    }
    bookmarkAlreadyExists(name) {
        let bookmarks = this.bookmarksRepository.getAll();
        for(let i = 0; i < bookmarks.length; i++) {
            if(bookmarks[i].Name === name)
                return true;
        }
        return false;
    }
    // POST: api/bookmarks body payload[{"Id": 0, "Name": "...", "Url": "...", "Category": "..."}]
    post(bookmark) {
        if((bookmark.Name === "" || bookmark.Name === undefined) || 
            (bookmark.Category === "" || bookmark.Category === undefined) || 
                (this.invalidUrl(bookmark.Url)) || bookmark.Url === undefined) {
                    this.response.badRequest();
        }
        else if(this.bookmarkAlreadyExists(bookmark.Name)) {
            this.response.conflict();
        }
        else {
            this.response.created(JSON.stringify(this.bookmarksRepository.add(bookmark)));
        }
    }
    // PUT: api/bookmarks body payload[{"Id": 0, "Name": "...", "Url": "...", "Category": "..."}]
    put(bookmark) {
        // todo : validate bookmark before updating
        if (this.bookmarksRepository.update(bookmark))
            this.response.ok();
        else 
            this.response.notFound();
    }
    // DELETE: api/bookmarks/{id}
    remove(id) {
        if (this.bookmarksRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
}