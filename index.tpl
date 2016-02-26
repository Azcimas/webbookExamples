
<div class="mainContent">
    <h1 id="top">Zarządanie Partnerami</h1>
    <button id="addPartnerButton" class="pure-button pure-button-primary" style="margin-bottom: 20px;">
        <i class="fa fa-plus"></i>  Dodawanie Partnera
    </button>
    <a href="/administracja/history" style="color: white; text-decoration: none;">
        <button id="historyButton" class="pure-button pure-button-primary" style="float: right; background-color: grey;">
            <i class="fa fa-history"></i>  Historia
        </button>
    </a>
    <table id="partner_respond" class="pure-table">
        <thead>
            <tr>
                <th>Usuń</th>
                <th>Edycja</th>
                <th style="display:none;">ID</th>
                <th>ID</th>
                <th>Partner</th>
                <th>Klucz</th>
                <th>Opis</th>
                <th>Baner WB</th>
                <th>Baner Sklep</th>
                <th>Widoczny</th>
            </tr>
        </thead>

        <tbody>

            {foreach from=$partners item=partner} 

                <tr id="item_{$partner.id}">

                    <td><div class="del_wrapper" align="center">
                            <a href="" class="del_button" id="del-{$partner.id}">
                                <i class="fa fa-trash fa-2x"></i></a></div></td>
                    <td><div class="del_wrapper" align="center">
                            <a href="" class="edit_button" id="del-{$partner.id}">
                                <i class="fa fa-pencil fa-2x"></i></a></div></td>
                    <td>{$partner.id}.</td>
                    <td class="partnerName" style="color: #b30000">{$partner.partner_name}</td>
                    <td class="partnerKey">{$partner.partner_key}</td>
                    <td class="partnerDescription">{$partner.partner_desc|nl2br nofilter}</td>
                    <td class="partnerBanner">
                        <a class="fancybox" rel="group" href="{$images}partnerzy/{$partner.partner_key}.jpg">
                            <img src="{$images}partnerzy/{$partner.partner_key}.jpg" height="27" width="40"></a>
                    </td>
                    <td class="partnerBanner">
                        <a class="fancybox" rel="group" href="{$sklepApplicationUrl}/images/partnerzy/{$partner.partner_key}/{$partner.partner_key}.jpg"> 
                            <img src="{$sklepApplicationUrl}/images/partnerzy/{$partner.partner_key}/{$partner.partner_key}.jpg" height="10" width="40" onerror="this.src='{$sklepApplicationUrl}/images/partnerzy/noimage.jpg'"></a>
                    </td>
                    <td class="partnerCheckbox">
                        <input type="checkbox" value="{$partner.id}" class="isActive"{if $partner.active == 1}checked="checked"{/if}>
                    </td>
                </tr>

            {/foreach}
        </tbody>
    </table>

</div>

<!-- Box do dodawania partnerów: -->
<div id="addcontent" style="display: none;">
    <div id="status_box" style="display: none;"></div>
    <textarea name="name_txt" id="nameText" placeholder="Podaj nazwę partnera"></textarea></br>
    <p class="errors" id="nameError" style="display: none;">*Wymagane</p>
    <textarea name="key_txt" id="keyText" placeholder="Podaj klucz partnera"></textarea>
    <p class="errors" id="keyError" style="display: none;">*Wymagane</p>
    <p class="errors" id="keyError2" style="display: none;">*Istnieje już partner z podany kluczem</p>
    <textarea name="desc_txt" id="descText" placeholder="Podaj opis partnera"></textarea>
    <p class="errors" id="descError" style="display: none;">*Wymagane</p>
    <div id="upload">
        <div style="float: left;">
            <h3 class="banerTitle">Baner webbook:</h3>
            <input id="inputFiles1" type="file"/>
            <p class="errors" id="banerError" style="display: none;">*Wymagane</p>
            <h3 class="banerTitle">Baner sklep:</h3>
            <input id="inputFiles2" type="file"/>
        </div>
        <div id="uploadstatus">
            <h3>Status:</h3>
            <div id="progress">
                <p id="loader">100%</p>
            </div>
        </div>
    </div>
    <button id="SubmitPartner" class="pure-button pure-button-primary">Dodaj partnera</button>
    <button id="EditPartner" class="pure-button pure-button-primary">Edycja partnera</button>
</div>






