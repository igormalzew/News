
/* Подробное отображение новости */


newNewsApp.controller('NewsDetailController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    $scope.$watch(function () { return $scope.MainControllers.ActiveCtrl }, function () {

        if ($scope.MainControllers.ActiveCtrl == $scope.MainControllers.NewsDetailCtrl.name) {
            $scope.DetailNews.setBrowse();
            $scope.DetailNews.getFullImage();
            document.getElementById("newsDetailView").scrollTop = 0;
            document.getElementById("newsHtmlContent").innerHTML = $scope.MainControllers.NewsDetailCtrl.SelectedNew.content;
        }
    });

    $scope.DetailNews = {
        getFullImage: function () {
            if ($scope.MainControllers.NewsDetailCtrl.SelectedNew.isFullImageLoaded == true) return;

            //$http({
            //    url: 'NewNews/GetFullNewsImage',
            //    method: "POST",
            //    data: {
            //        newsId: $scope.MainControllers.NewsDetailCtrl.SelectedNew.id
            //    }
            //}).then(function (res) {
            //    res = res.data;
            //    if (res.status == 'success') {
            //        $scope.MainControllers.NewsDetailCtrl.SelectedNew.image.value = res.data;
            //        $scope.MainControllers.NewsDetailCtrl.SelectedNew.isFullImageLoaded = true;
            //    } 
            //}, function () {
            //    location.reload();
            //});
        },
        setLike: function () {
            if ($scope.MainControllers.NewsDetailCtrl.SelectedNew.isPreview) return;

            //$http({
            //    url: 'NewNews/SetLike',
            //    method: "POST",
            //    data: {
            //        newsId: $scope.MainControllers.NewsDetailCtrl.SelectedNew.id
            //    }
            //}).then(function (res) {
            //    res = res.data;
            //    if (res.status == 'success') {

            //        if ($scope.MainControllers.NewsDetailCtrl.SelectedNew.isLiked)
            //            $scope.MainControllers.NewsDetailCtrl.SelectedNew.likeCount -= 1;
            //        else
            //            $scope.MainControllers.NewsDetailCtrl.SelectedNew.likeCount += 1;

            //        $scope.MainControllers.NewsDetailCtrl.SelectedNew.isLiked = !$scope.MainControllers.NewsDetailCtrl.SelectedNew.isLiked;
                    
            //    }
            //}, function () {
            //    location.reload();
            //});
        },
        setBrowse: function () {
            if ($scope.MainControllers.NewsDetailCtrl.SelectedNew.isBrowsed == true || $scope.MainControllers.NewsDetailCtrl.SelectedNew.isPreview) return;

            //$http({
            //    url: 'NewNews/setBrowse',
            //    method: "POST",
            //    data: {
            //        newsId: $scope.MainControllers.NewsDetailCtrl.SelectedNew.id
            //    }
            //}).then(function (res) {
            //    res = res.data;
            //    if (res.status == 'success') {
            //        $scope.MainControllers.NewsDetailCtrl.SelectedNew.isBrowsed = true;
            //        $scope.MainControllers.NewsDetailCtrl.SelectedNew.browseCount += 1;
            //    }
            //}, function () {
            //    location.reload();
            //});
        },
        getNewsFile: function (fileId) {
            if ($scope.MainControllers.NewsDetailCtrl.SelectedNew.isPreview) return;

            //$http({
            //    url: 'NewNews/GetNewsFile',
            //    method: "POST",
            //    params: { fileId: fileId }
            //}).then(function (res) {
            //    res = res.data;
            //    if (res.status === 'success') {
            //        window.open('ReportModule/Download?fullPath=' + res.path);
            //    } 
            //}, function () {
            //    location.reload();
            //});

        }
    };

    // Возврат с просмотра новости и прокрутка ленты
    document.addEventListener("keydown", function (e) {
        if (e.which == 8) {

            $scope.MainControllers.NewsDetailCtrl.goBack();

            if (e.srcElement != undefined && e.srcElement.className.indexOf('form-control') == -1 && e.srcElement.className.indexOf('note-editable') == -1 && e.srcElement.className.indexOf('news-search'))
                e.preventDefault();

            $scope.$apply();
        }
    });

}]);