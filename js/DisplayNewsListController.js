
/* Отображение списка новостей */


newNewsApp.controller('DisplayNewsListController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    $scope.$watch(function () { return $scope.MainControllers.EditNewsCtrl.changedNewsId }, function () {
        if ($scope.MainControllers.EditNewsCtrl.changedNewsId === null) return;

        $scope.News.getNews({ replaceItemId: $scope.MainControllers.EditNewsCtrl.changedNewsId });
        $scope.MainControllers.EditNewsCtrl.changedNewsId = null;
    });


    $scope.SideBarFilter = {
        newsTag: {
            isLoading: false,
            items: [],
            add: function (item) {
                this.items.push(item);
            },
            create: function (isSelected, tagId, tagName) {
                return {
                    isSelected: isSelected,
                    tagId: tagId,
                    tagName: tagName,
                    click: function () {
                        this.isSelected = !this.isSelected;
                        $scope.Search.doSearchWithTimeOut();
                    },
                };
            },
            init: function () {
                let availableTags = $scope.FakeServer.getTags();

                for (var i = 0; i < availableTags.length; i++) {
                    $scope.SideBarFilter.newsTag.add(
                        $scope.SideBarFilter.newsTag.create(true, availableTags[i].TagId, availableTags[i].TagName));
                }
            // Получение новостей после того как возможные категории инициализированы
                $scope.News.getNews();
            },
            getSelectedTags: function(){
                var result = [];
                for (var i = 0; i < this.items.length; i++) {
                    if(this.items[i].isSelected == true)
                        result.push(this.items[i].tagId);
                }
                return result;
            }
        },
        targetGroup: {
            isLoading: false,
            selectedGroupId: 0,
            items: [],
            click: function (val) {
                this.selectedGroupId = val;
                $scope.Search.doSearchWithTimeOut();
            },
            add: function (item) {
                this.items.push(item);
            },
            create: function (groupId, groupName) {
                return {
                    groupId: groupId,
                    groupName: groupName
                };
            },
            init: function () {
                let availableTagGroups = $scope.FakeServer.getTargetGroups();

                for (var i = 0; i < availableTagGroups.length; i++) {
                    $scope.SideBarFilter.targetGroup.add(
                        $scope.SideBarFilter.targetGroup.create(availableTagGroups[i].TagId, availableTagGroups[i].TagName));
                }
            }
        },
        dateOfPublication: {
            value: null,
            getStartDate: function () {
                var value = $('#DateOfPublication').val();
                if (value == null || value == undefined || value == "") return null;
                return value.split(' - ')[0] != undefined ? value.split(' - ')[0] : null;
            },
            getEndDate: function () {
                var value = $('#DateOfPublication').val();
                if (value == null || value == undefined || value == "") return null;
                return value.split(' - ')[1] != undefined ? value.split(' - ')[1] : null;
            }
        }
    };

    $scope.Search = {
        isLoading: false,
        value: '',

        timeOutCancel: null,
        doSearchWithTimeOut: function () {
            if (this.timeOutCancel != null)
                $timeout.cancel(this.timeOutCancel);

            this.timeOutCancel = $timeout(function () {
                $scope.News.getNews();
            }, 650);
        }
    };

    $scope.News = {
        items: [],
        lastNewsOffset: 0,
        create: function (item) {
            return item == null ? null : {
                id: item.id,
                topic: item.topic,
                content: item.content,
                tags: item.tags,
                isImportant: item.tags.some(function (tag) { return tag.TagId === 1 }), // TagId 1 - Важное
                displayedTags: item.tags.filter(function (item) { return item.IsDisplayed }),
                image: item.image.id > 0 ? item.image : $scope.MainControllers.NewsDetailCtrl.defaultImageAsBase64,
                isSelectWithColor: item.isSelectWithColor,
                isFullImageLoaded: item.imageBase64 != '' ? item.isFullImageLoaded : true,
                creationTime: {
                    month: moment(item.creationTime).format('DD/MM'),
                    year: moment(item.creationTime).format('YYYY')
                },
                browseCount: item.browseCount,
                isBrowsed: item.isBrowsed,
                likeCount: item.likeCount,
                isLiked: item.isLiked,
                files: item.files
            }
        },
        addRange: function (range, isAdditionalNewsLoading) {
            
            if (!isAdditionalNewsLoading)
                this.items = [];

            for (var i = 0; i < range.length; i++) {
                this.items.push(this.create(range[i]));
            }

            if (!isAdditionalNewsLoading)
                document.getElementById('newsScrollViewport')['scrollTop'] = 0;
            

            /* обновление размера скрола */
            $timeout(function () { $scope.resizeNewsTable() }, 401);
            $timeout(function () { $('#newsScroll').fancyScroll({ reload: true }); }, 402);
        },
        replaceItem: function (changedItem) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id == changedItem.id) {
                    this.items.splice(i, 1);
                    this.items.splice(i, 0, $scope.News.create(changedItem));
                    return;
                }
            };           
        },
        getNews: function (params) {
            if (params == undefined) params = {};
            if (params.isAdditionalNewsLoading) {
                if (this.items.length === this.lastNewsOffset)
                    return;

                this.lastNewsOffset = this.items.length;
            }
            else
                this.lastNewsOffset = 0;


            $scope.Search.isLoading = true;
            this.timeOutCancel = null;

            //$http({
            //    url: '',
            //    method: "POST",
            //    data: {
            //        offset: params.isAdditionalNewsLoading ? this.items.length : 0,
            //        count: 15,
            //        filter: {
            //            Id: params.replaceItemId != undefined ? params.replaceItemId : null,
            //            Search: $scope.Search.value,
            //            NewsTags: $scope.SideBarFilter.newsTag.getSelectedTags(),
            //            TargetGroup: $scope.SideBarFilter.targetGroup.selectedGroupId != 0 ? $scope.SideBarFilter.targetGroup.selectedGroupId : null,
            //            StartDate: $scope.SideBarFilter.dateOfPublication.getStartDate(),
            //            EndDate: $scope.SideBarFilter.dateOfPublication.getEndDate()
            //        }
            //    }
            //}).then(function (res) {
            //    res = res.data;

            let res = $scope.FakeServer.news.getNews();

            if (res.status == 'success') {
                if (params.replaceItemId != undefined && res.data.length == 1)
                    $scope.News.replaceItem(res.data[0]);
                else
                    $scope.News.addRange(res.data, params.isAdditionalNewsLoading);
            }
            else if (res.status == 'error')
                alert('Произошло непредвиденное исключение. Обновите страницу.');
            else
                location.reload();

            $scope.Search.isLoading = false;

            //}, function () {
            //    location.reload();
            //});

        },
        goToNewsDetail: function (item) {
            $scope.MainControllers.NewsDetailCtrl.SelectedNew = item;
            $scope.MainControllers.setActive($scope.MainControllers.NewsDetailCtrl.name);
        },
        goToEditNews: function (item, isEdit) {
            if (isEdit == true) {
                $scope.MainControllers.NewsDetailCtrl.SelectedNew = item;
                $scope.MainControllers.NewsDetailCtrl.SelectedNew.isEdit = true;
            }
            else {
                $scope.MainControllers.NewsDetailCtrl.SelectedNew = {};
                $scope.MainControllers.NewsDetailCtrl.SelectedNew.isEdit = false;
            }

            $scope.MainControllers.setActive($scope.MainControllers.EditNewsCtrl.name);
        },
        deleteNewsQuestion: function (item) {
            $scope.MainControllers.NewsDetailCtrl.SelectedNew = item;
            $scope.MainControllers.DisplayNewsListCtrl.isNewsDeleteProcessing = true;
        },
        deleteNews: function () {
            $http({
                url: 'NewNews/DeleteNews',
                method: "POST",
                data: {
                    newsId: $scope.MainControllers.NewsDetailCtrl.SelectedNew.id
                }
            }).then(function (res) {
                res = res.data;
                if (res.status == 'success') { }
                else if (res.status == 'error')
                    alert('Произошло непредвиденное исключение. Обновите страницу.');
                else
                    location.reload();

                $scope.MainControllers.DisplayNewsListCtrl.isNewsDeleteProcessing = false;

                $scope.News.getNews();

            }, function () {
                location.reload();
            });

        }
    };


    $scope.resizeNewsTable = function () {
        let filterSize = $('#sideBarFilter').height();
        $('#newsScroll').height($(window).height() - 40 > filterSize ? $(window).height() - 115 : filterSize - 70);
    };

    /* Показ главного окна при инициализации всех контроллеров */
    $scope.onReady = function () {
        var angularScope = angular.element('#MainNewNewsController').scope();
        angularScope.mainReady = true;
        angularScope.$apply();
    };
    setTimeout(function () {
        $scope.onReady();
    }, 700);
}]);