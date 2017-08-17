newNewsApp.controller('EmailSettingController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    $scope.$watch(function () { return $scope.MainControllers.ActiveCtrl }, function () {
        if ($scope.MainControllers.ActiveCtrl == $scope.MainControllers.EmailSettingCtrl.name) {
            $scope.copyOfEmails = JSON.parse(JSON.stringify($scope.Setting.emails));
            $scope.Setting.selectMain();
        }
    });

    $scope.Setting = {
        availableCategories: [],
        activeEmail: null,
        checkEmail: function (email) {
            let pattern = /[A-z0-9]{1,}@[A-z0-9]{1,}\.[A-z]{2,}/;
            email.error = !pattern.test(email.value);
        },
        emails: [],
        init: function (data) {
            this.availableCategories = data.availableCategories;
            this.emails = this.isJson(data.emailSettingByUser.emails) ? JSON.parse(data.emailSettingByUser.emails) : [];
            this.updateMainEmail(data.emailSettingByUser.mainEmail);
            this.selectMain();
        },
        isJson: function (str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        },
        selectMain: function () {
            for (var i = 0; i < this.emails.length; i++) {
                if (this.emails[i].isMainEmail) {
                    this.activeEmail = this.emails[i];
                    return;
                }
            }

            if (this.emails.length != 0)
                this.activeEmail = this.emails[0];
        },
        updateMainEmail: function (updateEmail) {
            if ((this.emails.length == 0 || !this.mainEmailExist()) && updateEmail != '') {
                this.emails.push({
                    isMainEmail: true,
                    value: updateEmail
                });
                
                this.selectMain();
                return;
            }

            this.emails.forEach((item, index) => {
                if (item.isMainEmail) {

                    if (updateEmail == '') {
                        this.emails.splice(index, 1);
                        this.activeEmail = null;
                    }
                    else
                        item.value = updateEmail;
                        
                    return;
                }
            });
        },
        mainEmailExist: function () {
            var res = false;
            this.emails.forEach((item) => {
                if (item.isMainEmail)
                    res = true;
            });
            return res;
        },
        addEmail: function () {
            let newEmail = { error: true };
            this.emails.push(newEmail);
            this.activeEmail = newEmail;
        },
        deleteEmail: function () {
            this.emails.forEach((email, index) => {
                if (email === this.activeEmail) {
                    this.emails.splice(index, 1);
                    this.activeEmail = null;

                    if (index < this.emails.length)
                        this.activeEmail = this.emails[index];

                    if (index == this.emails.length && index > 0)
                        this.activeEmail = this.emails[index - 1];
                }

            });
        },
        hasError: function () {
            return this.emails.some((item) => { return item.error == true });
        },
        isChanged: function () {
            return JSON.stringify($scope.copyOfEmails) !== JSON.stringify($scope.Setting.emails);
        },
        save: function () {

            if (this.hasError()) {
                $scope.Setting.hideAlerts = true;
                $timeout(function () {
                    $scope.Setting.hideAlerts = false;
                }, 400);
                return;
            }



            //$http({
            //    url: '',
            //    method: "POST",
            //    data: $scope.Setting.emails
            //}).then(function (res) {
            //    res = res.data;
            //    if (res.status === 'success') {
            //        $scope.Setting.saveSettingAlert = true;
            //        $scope.copyOfEmails = JSON.parse(JSON.stringify($scope.Setting.emails));
                   
            //        $timeout(function () { $scope.Setting.saveSettingAlert = false; }, 3000);
            //    }
            //}, function () {
            //    location.reload();
            //});
        },
        isCategorySelected: function (tagId) {
            if (this.activeEmail == null) return;

            if (this.activeEmail.selectedCategories === undefined)
                return !this.activeEmail.isAllDeselected;

            var res = false;
            this.activeEmail.selectedCategories.forEach((item) => {
                if (item === tagId) {
                    res = true;
                    return;
                }

            });

            return res;
        },
        toogleCategory: function (tagId) {
            if (this.activeEmail.selectedCategories === undefined) {
                this.activeEmail.selectedCategories = [];

                if (!this.activeEmail.isAllDeselected)
                    $scope.Setting.availableCategories.forEach((item) => {
                        this.activeEmail.selectedCategories.push(item.TagId);
                    });
            }

            let removed = false;
            this.activeEmail.selectedCategories.forEach((item, index) => {
                if (item === tagId) {
                    this.activeEmail.selectedCategories.splice(index, 1);
                    removed = true;
                }
            });

            if (!removed)
                this.activeEmail.selectedCategories.push(tagId);

            this.activeEmail.isAllDeselected = this.activeEmail.selectedCategories.length == 0 ? true : null;
        },
        cancel: function () {
            $scope.Setting.emails = $scope.copyOfEmails;
            $scope.copyOfEmails = JSON.parse(JSON.stringify($scope.Setting.emails));
            $scope.Setting.selectMain();
        },
        close: function () {
            $scope.Setting.emails = $scope.copyOfEmails;
            $scope.MainControllers.setActive($scope.MainControllers.DisplayNewsListCtrl.name);
        }
    };

}]);
