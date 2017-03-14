Vue.config.devtools = true;

var newsStorageKey = 'saved_list';

function getNews(){
  if(localStorage.getItem(newsStorageKey)){
    return JSON.parse(localStorage.getItem(newsStorageKey));
  }
  return [];
}

function saveNews(value){
  localStorage.setItem(newsStorageKey, JSON.stringify(value));
}

var vm = new Vue({
    el: '#app',
    data: {
        newsStorageKey: 'saved_list',
        activeMenu: 'home',
        lastGrabTime: null,
        listDisplay:null,
        frontList: {
            display: null,
            actual: null
        },
        newestList: {
            display: null,
            actual: null
        }
    },
    computed: {
        savedList: function() {
            return getNews()
        }
    },
    created: function(){
        this.homeClicked();
    },
    watch: {
        savedList: function(savedList){
            console.log(savedList);
            console.log('changed');
            saveNews(savedList);
        }
    },
    methods:{
        homeClicked: function(event){
            var t = this;
            this.activeMenu = 'home';
            this.requestFront(function(items) {
                t.updateListIfDifferent(t.frontList, items);
                t.listDisplay = t.frontList.display;
                t.lastGrabTime = new Date();
            });
        },
        newestClicked: function(){
            var t = this;
            this.activeMenu = 'newest';
            this.requestNewest(function(items) {
                t.updateListIfDifferent(t.newestList, items);
                t.listDisplay = t.newestList.display;
                t.lastGrabTime = new Date();
            });
        },
        savedClicked: function(){
            this.activeMenu = 'saved';
            this.listDisplay = this.savedList;
        },
        saveNews: function(news) {
            news.saved = true;
            this.savedList.push(news);
            // localStorage.setItem(this.newsStorageKey, JSON.stringify(this.savedList));
        },
        removeNews: function(news) {
            var removedItem = this.savedList.filter(function(newsItem) {
                return (newsItem.guid != news.guid);
            });

            this.savedList = removedItem;
            // localStorage.setItem(this.newsStorageKey, JSON.stringify(removedItem));
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