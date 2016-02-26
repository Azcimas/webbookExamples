
$(document).ready(function () {

    $('#uploadstatus').hide();

    /*
     * Dodanie partnera.
     */
    $(document).on('click', ".boxes #SubmitPartner", function (e) {
        e.preventDefault();
        if ($(".boxes #nameText").val() === '') {
            $(".boxes #nameText").val('');
            $('.boxes #nameError').show();
        }
        if ($(".boxes #keyText").val() === '') {
            $(".boxes #keyText").val('');
            $('.boxes #keyError').show();
            $('.boxes #SubmitPartner').attr("disabled", true);
        }
        if ($(".boxes #descText").val() === '') {
            $(".boxes #descText").val('');
            $('.boxes #descError').show();
        }
        if ($(".boxes #inputFiles1").val() === '') {
            $(".boxes #inputFiles1").val('');
            $('.boxes #banerError').show();
        }
        if ($(".boxes #inputFiles1").val() === '' ||
                $(".boxes #descText").val() === '' ||
                $(".boxes #keyText").val() === '' ||
                $(".boxes #nameText").val() === '') {
            return false;
        }
        var arr = {
            keyText: $(".boxes #keyText").val()
        };
        jQuery.ajax({
            url: "/ajax/administracja/partners/keycheck",
            data: arr,
            success: function (ans) {
                if (ans.partner_layout === false) {
                    $(".boxes #keyText").val('');
                    $(".boxes #keyError2").show();
                    $('.boxes #SubmitPartner').attr("disabled", true);
                } else {
                    $('.boxes #SubmitPartner').attr("disabled", false);
                    $(".boxes #keyError2").hide();

                    /*
                     * Przekazanie Xupload'em elementów do controllera partnerów.
                     */
                    var arr = {
                        nameText: $(".boxes #nameText").val(),
                        keyText: $(".boxes #keyText").val(),
                        descText: $(".boxes #descText").val(),
                        file1: $('.boxes #inputFiles1').val(),
                        file2: $('.boxes #inputFiles2').val(),
                        action: 'adding',
                        filesStatus: 'files'
                    };

                    uploader.extendPost(arr);
                    uploader.upload();
                }
            }
        });
    });
    /*
     * Otwarcie okna dodawania partnera.
     */
    $("#addPartnerButton").click(function () {
        $('#EditPartner').hide();
        $('#SubmitPartner').show();
        $("#keyText").attr("disabled", false);
        $('#SubmitPartner').attr("disabled", true);

        Boxes.create({
            "class": 'regulaminBox new white',
            title: 'Dodawanie partnera',
            content: $('#addcontent').html(),
            width: 600,
            height: 600
        }).open();



        xuploadInit();
        uploadValidation();

    });

    /*
     * Usuwanie partnerów.
     */

    $("body").on("click", "#partner_respond .del_button", function (e) {
        e.preventDefault();
        /*
         * Walidacja czy użytkownik jest pewny usunięcia.
         */
        if (confirm('Czy na pewno chcesz usunąć pozycję?')) {
            /*
             * Wczytanie id usuwanego elementu.
             */
            var clickedID = this.id.split('-');
            var Db_ID = clickedID[1];

            var key = $('tr#item_' + Db_ID + ' td:nth-child(5)').html();
            var arr = {
                partnerToDelete: Db_ID,
                partnerKey: key
            };
            /*
             * Przekazanie danych do controllera partnerów.
             */
            jQuery.ajax({
                url: "/ajax/administracja/partners/deletepartner",
                data: arr,
                /*
                 * Sukces: fadeout partera z listy + zrestartowanie wpisanych wartosci.
                 */
                success: function () {
                    $('#item_' + Db_ID).fadeOut();
                    $(".boxes #nameText").val('');
                    $(".boxes #descText").val('');
                    $(".boxes #keyText").val('');
                }
            });
        }
    });

    /*
     * Edycja partnera
     */
    $("body").on("click", "#partner_respond .edit_button", function (e) {
        e.preventDefault();
        $("#Db_ID").remove();
        /*
         * Zmiana submita,pól do wpisywanie wartości i wyświetlanego tekstu 
         * z dodawnie partnera na edycja.
         */
        $("#SubmitPartner").hide();
        $("#EditPartner").show();
        $("#keyText").attr("disabled", true);
        /*
         * Otwarcie okna edycji partnera.
         */
        Boxes.create({
            "class": 'regulaminBox new white',
            title: 'Edycja partnera',
            content: $('#addcontent').html(),
            width: 600,
            height: 550
        }).open();

        xuploadInit();
        uploadValidation();
        /*
         * Wczytanie id elementu.
         */
        var clickedID = this.id.split('-');
        var Db_ID = clickedID[1];
        /*
         * Wpisanie wartosci do edycji z tabeli do inputów. 
         */
        var x = $('tr#item_' + Db_ID + ' .partnerName').html();
        $(".boxes #nameText").val(x);

        var y = $('tr#item_' + Db_ID + ' .partnerKey').html();
        $(".boxes #keyText").val(y);

        var z = $('tr#item_' + Db_ID + ' .partnerDescription').html();
        final_z = z.replace(/<br\s*\/?>/mg, "");
        $(".boxes #descText").val(final_z);

        /*
         * Stworzenie hidden inputa, który przechowa ID do edycji.
         */
        var ip = $('<input>').attr({
            type: 'hidden',
            id: 'Db_ID',
            name: 'Db_ID',
            value: Db_ID
        });
        $(ip).appendTo('body');
        /*
         * Po zatwierdzeniu zmian:
         */
        $(".boxes #EditPartner").click(function (e) {
            e.preventDefault();
            /*
             * Walidacja czy wszystko zostało wpisane.
             */
            if ($(".boxes #nameText").val() === '') {
                $(".boxes #nameText").val('');
                $('.boxes #nameError').show();
            }
            if ($(".boxes #descText").val() === '') {
                $(".boxes #descText").val('');
                $('.boxes #descError').show();
            }
            if ($(".boxes #descText").val() === '' || $(".boxes #nameText").val() === '') {
                return false;
            }
            var Db_ID = $('#Db_ID').val();

            check = 0;
            if ($('tr#item_' + Db_ID + ' .isActive').is(':checked')) {
                check = 1;
            } else {
                check = 0;
            }

            if ($(".boxes #inputFiles1").val() === '' &&
                    $(".boxes #inputFiles2").val() === '') {
                var arr = {
                    nameText: $('.boxes #nameText').val(),
                    descText: $('.boxes #descText').val(),
                    keyText: $('tr#item_' + Db_ID + ' td:nth-child(5)').html(),
                    id: Db_ID,
                    action: 'editing',
                    filesStatus: 'nofiles'
                };
                jQuery.ajax({
                    url: "/ajax/administracja/partners/addeditpartner",
                    data: arr,
                    success: function (ans) {
                        var html = '<td>' +
                                '<div class="del_wrapper" align="center">\n\
                            <a href="" class="del_button" id="del-' + ans.id + '">' +
                                '<i class="fa fa-trash fa-2x"></i></a></div></td><td>' +
                                '<div class="del_wrapper" align="center">\n\
                            <a href="" class="edit_button" id="del-' + ans.id + '">' +
                                '<i class="fa fa-pencil fa-2x"></a></div>' +
                                '</td><td>' +
                                ans.id + '.</td><td class="partnerName" style="color: #b30000">' +
                                ans.name + '</td><td class="partnerKey">' +
                                ans.key + '</td><td class="partnerDescription">' +
                                ans.desc.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</td><td>' +
                                '<a class="fancybox" rel="group" href="/images/partnerzy/' +
                                ans.key + '.jpg"><img src="/images/partnerzy/' +
                                ans.key + '.jpg" height="27" width="40"></a></td><td>' +
                                '<a class="fancybox" rel="group" href="http://webbook-sklep.aszymanski.local/images/partnerzy/' + ans.key + '/' +
                                ans.key + '.jpg"><img src="http://webbook-sklep.aszymanski.local/images/partnerzy/' + ans.key + '/' +
                                ans.key + '.jpg" height="10" width="40"></a></td>';
                        if (check === 1) {
                            html += '<td class="partnerCheckbox"><input type="checkbox" value="' + ans.id + '" class="isActive" checked="checked"></td>';
                        } else {
                            html += '<td class="partnerCheckbox"><input type="checkbox" value="' + ans.id + '" class="isActive"></td>';
                        }
                        $("#partner_respond #item_" + ans.id).html(html);
                        Boxes.close('all');
                        info('Edycja Zakończona!', 'ok');

                    }
                });
            } else {
                var arr = {
                    nameText: $('.boxes #nameText').val(),
                    descText: $('.boxes #descText').val(),
                    keyText: $('tr#item_' + Db_ID + ' td:nth-child(5)').html(),
                    file1: $('.boxes #inputFiles1').val(),
                    file2: $('.boxes #inputFiles2').val(),
                    id: Db_ID,
                    action: 'editing',
                    filesStatus: 'files'
                };
                uploader.extendPost(arr);
                uploader.upload();
            }

        });

    });
});


$('.shopbannerChangeButton').click(function () {
    var partner_class = this.id;
    var partner_name = partner_class.substr(0, partner_class.indexOf('_'));
    if (confirm('Czy na pewno chcesz przywrócić baner partnera "' + partner_name.toUpperCase() +'"?')) {
        var arr = {
            bannerPath: $('.' + partner_name + '_2').val(),
            partner: partner_name
        };
        
        var ip = $('<input>').attr({
            type: 'hidden',
            id: 'partnerInput',
            value: partner_name
        });
        $(ip).appendTo('body');
        console.log($('#partnerInput').val());
        jQuery.ajax({
            url: "/ajax/administracja/partners/shopbannerswap",
            data: arr,
            success: function () {
                info('Baner został przywrócony!!', 'ok');
                console.log('#shopItem' + $('#partnerInput').val());
                $('#shopItem_' + $('#partnerInput').val()).fadeOut();
                
            }
        });
    }
});

$('.wbbannerChangeButton').click(function () {
    var partner_class = this.id;
    if (confirm('Czy na pewno chcesz przywrócić baner partnera "' + partner_class.toUpperCase() +'"?')) {
        var arr = {
            bannerPath: $('.' + partner_class).val(),
            partner: partner_class
        };
        var ip = $('<input>').attr({
            type: 'hidden',
            id: 'partnerInput',
            value: partner_class
        });
        $(ip).appendTo('body');
        jQuery.ajax({
            url: "/ajax/administracja/partners/wbbannerswap",
            data: arr,
            success: function () {
                info('Baner został przywrócony!!', 'ok');
                $('#wbItem_' + $('#partnerInput').val()).fadeOut();
            }
        });
    }
});


$('.descBannerChangeButton').click(function() {
    var clickedID = this.id.split('_');
    var Db_ID = clickedID[2];
    var partner_id = clickedID[1];
    var desc = $('#' + this.id).html();
    
    if (confirm('Czy na pewno chcesz przywrócić opis partnera"?')) {     
        var arr = {
            partner_id: partner_id,
            id: Db_ID,
            description: desc
        };
        jQuery.ajax({
            url: "/ajax/administracja/partners/descswap",
            data: arr,
            success: function (ans) {
                info('Opis został przywrócony!', 'ok');
                $('#item_' + ans.partner_layout[0] + '_' + ans.partner_layout[1]).html(ans.partner_layout[2]['partner_desc']);
            }
        });
    }
});


$(".fancybox").fancybox();

/*
 * Funkcja pobiera checkbox i przesyła AJAX do modelu by pokazac/schowac 
 * partnera na stronie głównej.
 */
$(document).on('change', '.isActive', function () {
    var check;
    if ($(this).is(':checked')) {
        check = 1;
    } else {
        check = 0;
    }
    var Db_ID = $(this).val();
    var arr = {
        id: Db_ID,
        check: check
    };
    jQuery.ajax({
        url: "/ajax/administracja/partners/activepartner",
        data: arr,
        success: function () {

        }
    });
});


/*
 * Walidacja czy nie powtarza się klucz.
 */

$(document).on('change', '#keyText', function () {
    keyChecking();
});

function keyChecking() {
    var arr = {
        keyText: $(".boxes #keyText").val()
    };
    jQuery.ajax({
        url: "/ajax/administracja/partners/keycheck",
        data: arr,
        success: function (ans) {
            if (ans.partner_layout === false) {
                $(".boxes #keyText").val('');
                $(".boxes #keyError2").show();
            } else {
                $('.boxes #SubmitPartner').attr("disabled", false);
                $(".boxes #keyError2").hide();
            }
        }
    });
}



/*
 * Sortowanie partnerów, ustawienie partnerów w tabeli odpowiada ustawieniu na
 * głównej stronie. Sortowanie wywołuje Ajax który przesyła aktualne ustawienie do
 * bazy.
 */
$("#partner_respond tbody").sortable({
    stop: function () {
        var table = $("#partner_respond tbody");
        var id_order = [];
        table.find('tr').each(function () {
            var $tds = $(this).find('td');
            id_order.push($tds.eq(2).text());

        });
        var arr = {
            idOrder: id_order
        };
        jQuery.ajax({
            url: "/ajax/administracja/partners/orderpartner",
            data: arr,
            success: function () {
            }

        });
    }

});

/*
 * Walidacja rozmiaru i rozszerzenia pliku.
 */
function uploadValidation() {
    $(".boxes #inputFiles1, .boxes #inputFiles2").change(function () {
        var avatar = $(this).val();
        var extension = avatar.split('.').pop().toUpperCase();
        if (extension !== "JPG") {
            info('Zły format! Dostępny format to JPEG/JPG.', 'notok');
            $(this).val("");
        } else {
            if (this.files[0].size > 5000000) {
                info('Maksymalny rozmiar to 5mb!', 'notok');
                $(this).val("");
            } else {
            }
        }
    });
}


function xuploadInit() {
    uploader = new Xupload({
        id: 'productImport',
        element: [$(".boxes #inputFiles1"), $(".boxes #inputFiles2")],
        url: '/administracja/partners/addeditpartner',
        allow: ['image/jpeg'],
        method: 'single',
        autoUpload: false,
        onProgress: function () {
            $('.boxes #loader').html(this.progress + '%');
            $('.boxes #progress').width((this.progress) * 2);
        },
        onFileStart: function () {
            $('.boxes #uploadstatus').show();
            $('.boxes #progress').show();
        },
        onUploadFinish: function (ans) {
            $('.boxes #loader').html(100 + '%');
            $('.boxes #progress').width(200);
            $('.boxes #uploadstatus').fadeOut(1000);
            /*
             * Sprawdznie czy nie ma PHP Error - związany z wpisaniem
             * poprawnych danych.
             */
            if (ans.Error) {
                info(ans.Error, 'notok');
                $(".boxes #inputFiles1, .boxes #inputFiles2").val('');
            } else {
                if (ans.action === 'adding') {
                    var html = '<tr id="item_' + ans.id + '"><td>' +
                            '<div class="del_wrapper" align="center">\n\
                            <a href="" class="del_button" id="del-' + ans.id + '">' +
                            '<i class="fa fa-trash fa-2x"></i></a></div></td><td>' +
                            '<div class="del_wrapper" align="center">\n\
                            <a href="" class="edit_button" id="del-' + ans.id + '">' +
                            '<i class="fa fa-pencil fa-2x"></a></div>' +
                            '</td><td>' +
                            ans.id + '.</td><td class="partnerName" style="color: #b30000">' +
                            ans.name + '</td><td class="partnerKey">' +
                            ans.key + '</td><td class="partnerDescription">' +
                            ans.desc.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</td><td>' +
                            '<a class="fancybox" rel="group" href="/images/partnerzy/' +
                            ans.key + '.jpg"><img src="/images/partnerzy/' +
                            ans.key + '.jpg" height="27" width="40"></a></td><td>' +
                            '<a class="fancybox" rel="group" href="' + shopUrl + '/images/partnerzy/' + ans.key + '/' +
                            ans.key + '.jpg"><img src="' + shopUrl + '/images/partnerzy/' + ans.key + '/' +
                            ans.key + '.jpg" height="10" width="40"></a></td>' +
                            '<td class="partnerCheckbox"><input type="checkbox" value="' + ans.id + '" class="isActive"></td>';
                    $("#partner_respond").append(html);
                    $('.boxes .errors').hide();
                    Boxes.close('all');
                    info('Partner Dodany!', 'ok');
                }
                if (ans.action === 'editing') {
                    var html = '<td>' +
                            '<div class="del_wrapper" align="center">\n\
                            <a href="" class="del_button" id="del-' + ans.id + '">' +
                            '<i class="fa fa-trash fa-2x"></i></a></div></td><td>' +
                            '<div class="del_wrapper" align="center">\n\
                            <a href="" class="edit_button" id="del-' + ans.id + '">' +
                            '<i class="fa fa-pencil fa-2x"></a></div>' +
                            '</td><td>' +
                            ans.id + '.</td><td class="partnerName" style="color: #b30000">' +
                            ans.name + '</td><td class="partnerKey">' +
                            ans.key + '</td><td class="partnerDescription">' +
                            ans.desc.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</td><td>' +
                            '<a class="fancybox" rel="group" href="/images/partnerzy/' +
                            ans.key + '.jpg?t=' + (new Date().getTime()) + '"><img src="/images/partnerzy/' +
                            ans.key + '.jpg?t=' + (new Date().getTime()) + '" height="27" width="40"></a></td><td>' +
                            '<a class="fancybox" rel="group" href="' + shopUrl + '/images/partnerzy/' + ans.key + '/' +
                            ans.key + '.jpg?t=' + (new Date().getTime()) + '"><img src="' + shopUrl + '/images/partnerzy/' + ans.key + '/' +
                            ans.key + '.jpg?t=' + (new Date().getTime()) + '" height="10" width="40"></a></td>';
                    if (check === 1) {
                        html += '<td class="partnerCheckbox"><input type="checkbox" value="' + ans.id + '" class="isActive" checked="checked"></td>';
                    } else {
                        html += '<td class="partnerCheckbox"><input type="checkbox" value="' + ans.id + '" class="isActive"></td>';
                    }
                    $("#partner_respond #item_" + ans.id).html(html);
                    Boxes.close('all');
                    info('Edycja Zakończona!', 'ok');
                }
            }
        },
        onFileAdd: function () {

        }
    });
}