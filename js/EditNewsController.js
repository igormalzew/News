
/* Редактирование / создание новости */

function changeNewsFiles() {
    var angularScope = angular.element('#EditNewsController').scope();

    var files = $("#newsFilesInput")[0].files;

    for (var i = 0; i < files.length; i++) {

        let reader = new FileReader();
        reader._index = i;
        reader.onload = function (e) {
            if (files[e.target._index].name, e.target.result.match(/,(.*)$/).length != 2)
                return;

            angularScope.EditNew.files.add(null, files[e.target._index].name, e.target.result.match(/,(.*)$/)[1], '.' + files[e.target._index].name.split('.')[1]);
            angularScope.$apply();
        };

        reader.readAsDataURL(files[i]);
    }
};

function changeNewBackgroundImage() {
    var angularScope = angular.element('#EditNewsController').scope();

    if ($("#newsImageInput")[0].files.length !== 1){
        angularScope.EditNew.editor.image.clear();
        angularScope.$apply();
    }
    else {
        let file = $("#newsImageInput")[0].files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            if (e.target.result.match(/,(.*)$/).length != 2 || (file.name.split('.')[1] != 'png' && file.name.split('.')[1] != 'jpeg' && file.name.split('.')[1] != 'jpg' && file.name.split('.')[1] != 'jpe'))
                return;

            angularScope.EditNew.editor.image.init(null, file.name, e.target.result.match(/,(.*)$/)[1], '.' + file.name.split('.')[1]);
            angularScope.$apply();
        };
        reader.readAsDataURL(file);
    }
};

newNewsApp.controller('EditNewsController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    $scope.$watch(function () { return $scope.MainControllers.ActiveCtrl }, function (newValue, oldValue) {
        if ($scope.MainControllers.ActiveCtrl == $scope.MainControllers.EditNewsCtrl.name && oldValue == $scope.MainControllers.DisplayNewsListCtrl.name) {
            $scope.EditNew.init($scope.MainControllers.NewsDetailCtrl.SelectedNew);
        }
    });


    $scope.EditNew = {
        tagChoose: {
            groups: [],
            categories: [],
            recipients: [],
            goalGroups: [],
            init: function (editNew) {
                this.groups = editNew.groups,
                this.categories = editNew.categories,
                this.recipients = editNew.recipients,
                this.goalGroups = editNew.goalGroups
            },
            isParentSelected: function (category) {
                if (category === undefined) return false;
                return this.groups.some(function (group) { return group.groupId === category.parentId && group.isSelected});
            },
            selectedCount: function (arr, isEspecial) {
                var count = 0;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].isSelected == true && (isEspecial == undefined || arr[i].isEspecial == isEspecial))
                        count++;
                }
                return count;
            },
            isMinimumTagsSelected: function () {
                let isEspecialSelected = this.selectedCount(this.groups, true) > 0;
                let otherTags = this.selectedCount(this.categories, false) > 0 && this.selectedCount(this.goalGroups) > 0;

                return isEspecialSelected || otherTags;
            },
            setSelect: function (arr, val, isEspecial) {
                for (var i = 0; i < arr.length; i++) {
                    if (isEspecial == undefined || arr[i].isEspecial == isEspecial)
                        arr[i].isSelected = val;
                }
            },
            changeGroup: function (group, isClick) {
                if (isClick == true)
                    group.isSelected = !group.isSelected;

                if (group.isEspecial && group.isSelected) {

                    this.setSelect(this.groups, false);
                    group.isSelected = true;

                    this.setSelect(this.recipients, false);
                    this.setSelect(this.goalGroups, false);
                    this.setSelect(this.categories, false, false);
                }
                else if (!group.isEspecial && group.isSelected) {
                    this.setSelect(this.groups, false, true);
                }

                if (this.selectedCount(this.groups, false) == 1 && group.isSelected)
                    this.setSelect(this.recipients, false);

                for (var i = 0; i < this.categories.length; i++) {
                    if (this.categories[i].parentId === group.groupId) {
                        this.categories[i].isSelected = false;
                    }

                    if (this.categories[i].isEspecial)
                        this.categories[i].isSelected = this.groups.filter((gr) => { return gr.groupId === this.categories[i].parentId})[0].isSelected;
                }

                if (this.selectedCount(this.groups) == 0) {
                    this.setSelect(this.recipients, false);
                    this.setSelect(this.categories, false);
                    this.setSelect(this.goalGroups, false);
                }
            },
            changeRecipient: function (recipient, isClick) {
                if (isClick == true)
                    recipient.isSelected = !recipient.isSelected;

                if (this.selectedCount(this.recipients) == 0) {
                    this.setSelect(this.groups, false);
                    this.setSelect(this.categories, false);
                    this.setSelect(this.goalGroups, false);
                }
            },
            getSelected: function (showOnlyDisplayedTags) {
                let result = [];

                for (let j = 0; j < this.categories.length; j++) {
                    if (this.categories[j].isSelected)
                        result.push(this.categories[j].tagId);
                }

                for (let j = 0; j < this.recipients.length; j++) {
                    if (this.recipients[j].isSelected)
                        result.push(this.recipients[j].tagId);
                }

                for (let j = 0; j < this.goalGroups.length; j++) {
                    if (this.goalGroups[j].isSelected)
                        result.push(this.goalGroups[j].tagId);
                }

                return result;
            },
            getDisplayedTags: function () {
                let result = [];

                for (let j = 0; j < this.categories.length; j++) {
                    if (this.categories[j].isSelected)
                        result.push({ TagId: this.categories[j].tagId, TagName: this.categories[j].tagName });
                }

                for (let j = 0; j < this.goalGroups.length; j++) {
                    if (this.goalGroups[j].isSelected)
                        result.push({ TagId: this.goalGroups[j].tagId, TagName: this.goalGroups[j].tagName });
                }

                return result;
            },
            containTag: function (tagId) {
                if ($scope.EditNew.tags == null) return false;

                for (var i = 0; i < $scope.EditNew.tags.length; i++) {
                    if ($scope.EditNew.tags[i].TagId === tagId)
                        return true;
                }
                return false;
            }
        },
        selectNewWithColor: {
            value: false,
            isImportantAndChangeValue: function () {
                let res = $scope.EditNew.tagChoose.groups.some(function (gr) { return gr.isSelected && gr.groupId === 1 }); // groupId 1 - Важное
                if (res)
                    this.value = false;
                return res;
            }
        },
        close: {
            isOpen: false,
            questionBeforeClose: function () {
                this.isOpen = true;
            },
            cancel: function () {
                this.isOpen = false;
            },
            start: function () {
                this.isOpen = false;
                $scope.EditNew.clear();
                $scope.MainControllers.setActive($scope.MainControllers.DisplayNewsListCtrl.name);
            }
        },
        publish: {
            isOpen: false,
            questionBeforePublish: function () {
                this.isOpen = true;
            },
            cancel: function () {
                this.isOpen = false;
            },
            start: function () {
                this.isOpen = false;
                $scope.EditNew.save();
            }
        },
        editor: {
            image: {
                isLoaded: false,
                id: null,
                name: 'Выберите файл',
                value: null,
                extension: null,
                init: function (id, name, value, extension) {
                    this.isLoaded = true,
                    this.id = id,
                    this.name = name,
                    this.value = value,
                    this.extension = extension
                },
                clear: function () {
                    this.id = null,
                    this.isLoaded = false,
                    this.name = 'Выберите файл',
                    this.value = null,
                    this.extension = null,
                    document.getElementById('newsImageInput').value = "";
                }
            },
            topic: '',
            content: ''
        },
        files: {
            items: [],
            add: function (id, name, value, extension) {
                this.items.push({
                    id: id,
                    name: name,
                    extension: extension,
                    value: value
                });
            },
            remove: function (item) {
                for (var i = this.items.length - 1; i >= 0; i--) {
                    if (this.items[i] === item) {
                        this.items.splice(i, 1);
                    }
                }
            }
        },
        init: function (selectedNew) {

            $scope.EditNew.isEdit = $scope.MainControllers.NewsDetailCtrl.SelectedNew.isEdit;
            $scope.EditNew.id = $scope.MainControllers.NewsDetailCtrl.SelectedNew.id;
            $scope.EditNew.tags = $scope.MainControllers.NewsDetailCtrl.SelectedNew.tags;

            /* Категории */
            $scope.EditNew.tagChoose.categories.forEach(function (item) {
                if ($scope.EditNew.tagChoose.containTag(item.tagId))
                    item.isSelected = true;
            });

            $scope.EditNew.tagChoose.groups.forEach(function (group) {
                if ($scope.EditNew.tagChoose.categories.some(function (category) { return category.parentId == group.groupId && category.isSelected; }))
                    group.isSelected = true;
            });

            $scope.EditNew.tagChoose.recipients.forEach(function (item) {
                if ($scope.EditNew.tagChoose.containTag(item.tagId))
                    item.isSelected = true;
            });

            $scope.EditNew.tagChoose.goalGroups.forEach(function (item) {
                if ($scope.EditNew.tagChoose.containTag(item.tagId))
                    item.isSelected = true;
            });

            /* Содержание */

            $scope.EditNew.editor.topic = selectedNew.topic;
            $scope.EditNew.editor.content = selectedNew.content;

            if (selectedNew.image != undefined && selectedNew.image.id > 0)
                $scope.EditNew.editor.image.init(selectedNew.image.id, selectedNew.image.name, selectedNew.image.value);

            $scope.EditNew.files.items = [];
            if (selectedNew.files != undefined && selectedNew.files != null)
                selectedNew.files.forEach(function (item) {
                    $scope.EditNew.files.add(item.id, item.name);
                });

            $scope.EditNew.selectNewWithColor.value = selectedNew.isSelectWithColor;

        },
        getNewsData: function () {
            return {
                isPreview: true,

                id: $scope.EditNew.id,
                topic: $scope.EditNew.editor.topic != undefined ? $scope.EditNew.editor.topic : '',
                content: $scope.EditNew.editor.content != undefined ? $scope.EditNew.editor.content : '',
                displayedTags: $scope.EditNew.tagChoose.getDisplayedTags(),
                image: $scope.EditNew.editor.image,
                isFullImageLoaded: !$scope.EditNew.isEdit,
                creationTime: $scope.EditNew.creationTime == undefined ? {
                    month: moment(new Date()).format('DD/MM'),
                    year: moment(new Date()).format('YYYY')
                } : $scope.EditNew.creationTime,
                isBrowsed: true,
                browseCount: 0,
                likeCount: 0,
                files: $scope.EditNew.files.items
            }
        },
        save: function () {
            if ($scope.EditNew.editor.topic == undefined || $scope.EditNew.editor.topic == null || $scope.EditNew.editor.topic == '') {
                alert('Заполните заголовок новости');
                return;
            }

        },
        getNewsFile: function (fileId) {
            if (fileId == null) return;


        },
        clear: function () {
            $scope.EditNew.tagChoose.setSelect($scope.EditNew.tagChoose.groups, false);
            $scope.EditNew.tagChoose.setSelect($scope.EditNew.tagChoose.categories, false);
            $scope.EditNew.tagChoose.setSelect($scope.EditNew.tagChoose.recipients, false);
            $scope.EditNew.tagChoose.setSelect($scope.EditNew.tagChoose.goalGroups, false);

            $scope.EditNew.editor.image.clear();
            $scope.EditNew.editor.topic = '';
            $scope.EditNew.editor.content = '';

            $scope.EditNew.files.items = [];
        },
        goToNewsDetail: function () {
            $scope.MainControllers.NewsDetailCtrl.SelectedNew = this.getNewsData();
            $scope.MainControllers.setActive($scope.MainControllers.NewsDetailCtrl.name);
        },
    };



    $scope.summernoteOptions = {
        height: 300,
        focus: true,
        fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Roboto', 'Times New Roman'],
        fontNamesIgnoreCheck: ['Roboto'],
        toolbar: [
                ['headline', ['style']],
                ['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
                ['textsize', ['fontsize']],
                ['fontname', ['fontname']],
                ['fontclr', ['color']],
                ['alignment', ['ul', 'ol', 'paragraph', 'lineheight']],
                ['height', ['height']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'hr']]
        ]
    };


    $scope.summernoteChange = function () {
        if ($scope.EditNew.editor.content == undefined || $scope.EditNew.editor.content == null) return;

        $scope.EditNew.editor.content = $scope.EditNew.editor.content.replace(/face="(.*)"/, ' style="font-family: $1"')
    };

}]);