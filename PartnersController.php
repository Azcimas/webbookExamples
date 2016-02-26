<?php

/*
 * Kontroler zarządania dodawaniem/edycji banerów dla utworzonych partnerów.
 */

class Administracja_PartnersController extends Administracja_BaseController {

    public function preDispatch() {
        parent::preDispatch();

        $this->view->setLayout('administracja_new');
        $this->view->addStylesFile('administracja_new');
        $this->view->addStylesFile('menu');
        $this->view->addStylesFile('administracja/partners/partners');
        $this->view->addStylesFile('font-awesome.min');
        $this->view->addStylesFile('jquery.fancybox');
        $this->view->addPostScriptsFile('jquery.fancybox.pack');
        $this->view->addPostScriptsFile('menu');
        $this->view->addPostScriptsFile('administracja/partners/partners');
        $this->view->addPluginFiles('xupload');
        $this->view->addStylesFile('boxesForms');
        $this->view->addPluginFiles('boxes');
        $config = Zend_Registry::get('config');
        $this->view->sklepApplicationUrl = $config['sklepApplicationUrl'];
        $this->view->setScriptVar('shopUrl', $config['sklepApplicationUrl']);
    }

    /*
     * Akcja wczytania danych o partnerach z bazy.
     */

    public function indexAction() {
        $partners = new Model_Addpartner();
        $this->view->partners = $partners->getPartners(0);
    }
    

    /*
     * Akcja edycji i dodawania partnerów.
     */

    public function addeditpartnerAction() {
        /*
         * Sprawdzenie czy jakiekolwiek pliki zostaly dodane do zmiany.
         */
        if ($_POST['filesStatus'] == 'files') {
            /*
             * Sprawdzenie czy plik jest *.jpeg i czy nie ma więcej niż 5mb.
             */
            if ($_POST['file1'] != '') {
                if ($_POST['file2'] != '') {
                    $this->webbookBanner();
                    $this->shopBanner(1);
                } else {
                    $this->webbookBanner();
                }
            } else {
                if ($_POST['file2'] != '') {
                    $this->shopBanner(0);
                }
            }
        }
        /*
         * Jeśli akcją jest dodawanie nowego partnera to przekazuje dane do modelu addPartner,
         * a jeśli edycja to do editPartner.
         */
        if ($_POST['action'] == 'adding') {
            $partners = new Model_Addpartner();
            die(json_encode($partners->addPartner($this->_getParam('nameText'), $this->_getParam('descText'), $this->_getParam('keyText'))));
        }
        if ($_POST['action'] == 'editing') {
            $partners = new Model_Addpartner();
            die(json_encode($partners->editPartner($this->_getParam('id'), $this->_getParam('nameText'), $this->_getParam('descText'), $this->_getParam('keyText'))));
        }
    }

    /*
     * Akcja usunięcia partnera. Przekazanie danych do modela.
     */

    public function deletepartnerAction() {
        $config = Zend_Registry::get('config');
        $webbookPath = APPLICATION_PATH . '/../document_root/images/partnerzy/';
        $shopAplicationPath = $config['sklepApplicationPath'];
        $webbookShopPath = $shopAplicationPath . '/../document_root/images/partnerzy/' . $this->_getParam('partnerKey');

        /*
         * Usunięcie wszystkich banerów partnera z webbook.
         */
        $webbook_mask = $webbookPath . $this->_getParam('partnerKey') . '*.jpg';
        array_map('unlink', glob($webbook_mask));
        /*
         * Usunięcie wszystkich banerów ze sklepu + usunięcie katalogu partnera.
         */
        if (file_exists($webbookShopPath)) {
            $webbook_sklep_mask = $webbookShopPath . '/' . $this->_getParam('partnerKey') . '*.jpg';
            array_map('unlink', glob($webbook_sklep_mask));
            rmdir($webbookShopPath);
        } else {
            
        }


        $partners = new Model_Addpartner();
        $this->_ajax->addData('partner_layout', $partners->deletePartner($this->_getParam('partnerToDelete')));
    }

    /*
     * Akcja przekazuje do modela listę, potrzebną do zmiany kolejności wyświetlania partnerów
     * na stronie głównej webbook. 
     */

    public function orderpartnerAction() {
        $partners = new Model_Addpartner();
        $this->_ajax->addData('partner_layout', $partners->orderPartner($this->_getParam('idOrder')));
    }

    /*
     * Akcja przekazuje do modelu ID i zmienną checked by wpisać do bazy 
     * czy partner ma być aktywny na stronie głównej
     */

    public function activepartnerAction() {
        $partners = new Model_Addpartner();
        $this->_ajax->addData('partner_layout', $partners->activePartner($this->_getParam('id'), $this->_getParam('check')));
    }

    /*
     * Funkcja dodająca baner i katalog do webbooka.
     */

    public function webbookBanner() {
        if ($_FILES[$_POST['file_id'][0]]['size'] > 5000000 ||
                $_FILES[$_POST['file_id'][0]]['type'] != 'image/jpeg') {
            die(json_encode(array('Error' => 'Zły format lub za duży rozmiar pliku!')));
            return false;
        } else {
            /*
             * Ścieżki do wrzucenia banerów do webbooka.
             */
            $webbookPath = APPLICATION_PATH . '/../document_root/images/partnerzy/';
            /*
             * Sprawdzenie czy istnieje już jakiś baner tego partnera na webbook.
             * Jeśli tak: Zmienia jego nazwę na starą + '_data zmiany'.
             */
            if (file_exists($webbookPath . $_POST['keyText'] . '.jpg')) {
                rename($webbookPath . $_POST['keyText'] . '.jpg', $webbookPath . $_POST['keyText'] . '_' . date("y-m-d") . '_' . time() . '.jpg');
            }

            /*
             * Przeniesienie banera webbook do katalogu i zmiana nazwy na klucz partnera.
             */
            if (!move_uploaded_file($_FILES[$_POST['file_id'][0]]['tmp_name'], $webbookPath . $_POST['keyText'] . '.jpg')) {
                die(json_encode(array('Error' => 'Błąd przy uploadzie do webbooka')));
            }
        }
    }

    /*
     * Funkcja dodająca baner i katalog do sklepu
     */

    public function shopBanner($y) {
        if ($_FILES[$_POST['file_id'][$y]]['size'] > 5000000 ||
                $_FILES[$_POST['file_id'][$y]]['type'] != 'image/jpeg') {
            die(json_encode(array('Error' => 'Zły format lub za duży rozmiar pliku!')));
            return false;
        } else {
            /*
             * Ścieżki do wrzucenia banerów do sklepu.
             */
            $config = Zend_Registry::get('config');
            $shopAplicationPath = $config['sklepApplicationPath'];
            $webbookShopPath = $shopAplicationPath . '/../document_root/images/partnerzy/' . $_POST['keyText'];
            /*
             * Sprawdzenie czy istnieje już jakiś baner tego partnera na webbook.
             * Jeśli tak: Zmienia jego nazwę na starą + '_data zmiany' i
             * zmienia katalog na starą nazwę + '_data zmiany'.
             * Jeśli nie: tworzy katalog o nazwie jak podany klucz.
             */
            if (file_exists($webbookShopPath)) {
                if (file_exists($webbookShopPath . '/' . $_POST['keyText'] . '.jpg')) {
                    rename($webbookShopPath . '/' . $_POST['keyText'] . '.jpg', $webbookShopPath . '/' . $_POST['keyText'] . '_' . date("y-m-d") . '_' . time() . '.jpg');
                }
            } else {
                mkdir($webbookShopPath, 0777, true);
            }

            /*
             * Przeniesienie banera webbook_sklep do katalogu i zmiana nazwy pliku na klucz partnera.
             */
            move_uploaded_file($_FILES[$_POST['file_id'][$y]]['tmp_name'], $webbookShopPath . '/' . $_POST['keyText'] . '.jpg');
        }
    }

    public function keycheckAction() {
        $partners = new Model_Addpartner();
        $this->_ajax->addData('partner_layout', $partners->keycheckPartner($this->_getParam('keyText')));
    }
    
    
    public function shopbannerswapAction() {
        $config = Zend_Registry::get('config');
        $shopAplicationPath = $config['sklepApplicationPath'];
        $webbookShopPath = $shopAplicationPath . '/../document_root/images/partnerzy/';
  
        rename($webbookShopPath .   $this->_getParam('partner') . '/' .  $this->_getParam('partner') . '.jpg' , 
                $webbookShopPath .   $this->_getParam('partner') . '/' .  $this->_getParam('partner') . '_' . date("y-m-d") . '_' . time() . '.jpg');
        rename($webbookShopPath . $this->_getParam('bannerPath') , 
                $webbookShopPath .   $this->_getParam('partner') . '/' .  $this->_getParam('partner') . '.jpg');
        
    }   
    
    public function wbbannerswapAction() {
        $webbookPath = APPLICATION_PATH . '/../document_root/';
        
        rename($webbookPath . 'images/partnerzy/' .  $this->_getParam('partner') . '.jpg', 
                $webbookPath . 'images/partnerzy/' .  $this->_getParam('partner') . '_' . date("y-m-d") . '_' . time() . '.jpg');
        
        rename($webbookPath . $this->_getParam('bannerPath'),
                $webbookPath . 'images/partnerzy/' .  $this->_getParam('partner') . '.jpg');
    }
    
    
    public function descswapAction() {
        $partners = new Model_Addpartner();
        $this->_ajax->addData('partner_layout', $partners->descHistory($this->_getParam('partner_id'), $this->_getParam('id'), $this->_getParam('description')));
    }
            

}
