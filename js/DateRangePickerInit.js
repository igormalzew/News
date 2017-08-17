$(document).ready(function () {
    //Инициализация фильтра по дате создания
    moment.locale('ru');

    $('#DateOfPublication').daterangepicker({
        ranges: {
            'Сегодня': [moment(), moment()],
            'Вчера': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Неделя': [moment().subtract(6, 'days'), moment()],
            'Месяц': [moment().startOf('month'), moment().endOf('month')]
        },
        locale: {
            format: 'DD.MM.YYYY',
            separator: ' - ',
            applyLabel: 'Готово',
            cancelLabel: 'Очистить',
            weekLabel: 'Н',
            customRangeLabel: 'Другой пeриод',
            daysOfWeek: moment.weekdaysMin(),
            monthNames: moment.monthsShort(),
            firstDay: moment.localeData().firstDayOfWeek()
        },
        opens: 'right',
        showWeekNumbers: true,
        autoUpdateInput: false
    });

    $('#DateOfPublication').val('');

    $('#DateOfPublication').on('apply.daterangepicker', function (ev, picker) {
        var startDate = picker.startDate.format('DD.MM.YYYY');
        var endDate = picker.endDate.format('DD.MM.YYYY');
        if (startDate !== endDate) {
            $(this).val(startDate + ' - ' + endDate);
        }
        else {
            $(this).val(startDate);
        }

        var angularScope = angular.element('#DisplayNewsListController').scope();
        angularScope.Search.doSearchWithTimeOut();

    });

    $('#DateOfPublication').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');

        var angularScope = angular.element(document.getElementById('DisplayNewsListController')).scope();
        angularScope.Search.doSearchWithTimeOut();
    });




    $(window).resize(function () {
        var angularScope = angular.element(document.getElementById('DisplayNewsListController')).scope();
        angularScope.resizeNewsTable();
    });


    document.addEventListener('wheel', function (event) {
        if (event.target.className == 'display-news' || event.target.className == 'display-news-page')
            document.getElementById('newsScrollViewport')['scrollTop'] += event.deltaY < 0 ? -100 : 100;
    }, true);

});