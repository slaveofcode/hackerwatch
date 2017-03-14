Vue.config.devtools = true;
Vue.config.debug = true;

var newsStorageKey = 'saved_list';

function getNews(){
  if(localStorage.getItem(newsStorageKey)){
    return JSON.parse(localStorage.getItem(newsStorageKey));
  }
  return [];
}

function saveNews(value) {
    var newsList = getNews();
    newsList.push(value);
    localStorage.setItem(newsStorageKey, JSON.stringify(newsList));
}

function removeNews(value) {
    var newsList = getNews();

    var freshList = newsList.filter(function(newsItem) {
        return (newsItem.guid != value.guid);
    });
    
    localStorage.setItem(newsStorageKey, JSON.stringify(freshList));
}

var vm = new Vue({
    el: '#app',
    data: {
        activeMenu: 'home',
        lastGrabTime: null,
        frontList: {
            display: null,
            actual: null
        },
        newestList: {
            display: null,
            actual: null
        },
        reloadSavedList: false,
        savedList: []
    },
    watch: {
        reloadSavedList: function(status) {
            console.log('updated ', status);
            if (status) {
                this.savedList = getNews();
                this.reloadSavedList = false;
            }
        }
    },
    created: function(){
        this.homeClicked();
    },
    methods:{
        homeClicked: function(event){
            var t = this;
            this.activeMenu = 'home';
            this.requestFront(function(items) {
                t.updateListIfDifferent(t.frontList, items);
                t.lastGrabTime = new Date();
            });
        },
        newestClicked: function(){
            var t = this;
            this.activeMenu = 'newest';
            this.requestNewest(function(items) {
                t.updateListIfDifferent(t.newestList, items);
                t.lastGrabTime = new Date();
            });
        },
        savedClicked: function(){
            this.activeMenu = 'saved';
            this.reloadSavedList = true;
        },
        saveNews: function(news) {
            saveNews(news);
            this.reloadSavedList = true;
        },
        removeNews: function(news) {
            removeNews(news);
            this.reloadSavedList = true;
        },
        updateListIfDifferent: function(data, listItem) {

            if (data.display === null || data.actual === null) {
                data.display = listItem;
                data.actual = listItem;
                console.log('list updated');
            } else {
                // compare
                if (!_.isEqual(data.actual, listItem)) {
                    data.display = listItem;
                    data.actual = listItem;
                    console.log('list updated');
                } else {
                    console.log('not updated, no new list found');
                }
            }
            
        },
        requestFront: function(callback) {
            this.requestApi('http://hnrss.org/frontpage', function(results){
                if (results.status == 'ok') {
                    callback(results.items);
                } else {
                    callback(null);
                    console.log('Got problem on fetching list');
                }
            });
        },
        requestNewest: function(callback) {
            this.requestApi('http://hnrss.org/newest?points=300', function(results){
                if (results.status == 'ok') {
                    callback(results.items);
                } else {
                    callback(null);
                    console.log('Got problem on fetching list');
                }
            });
        },
        requestApi: function(endpoint, callback) {
            var apibase = 'https://api.rss2json.com/v1/api.json?rss_url=';

            this.$http.get(apibase + endpoint).then(function(response) {
                callback(response.body);
            }, function (error) {
                console.log('error');
            });
        }
    }
});