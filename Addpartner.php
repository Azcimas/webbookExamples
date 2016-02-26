<?php

/*
 * Model do zarządzania banerami partnera.
 * Znajdują się tutaj wszystki zapytania do bazy partners_layout.
 */

class Model_Addpartner extends Model_Base_Db {

    protected $_partner_layout;
    protected $_partner_desc_history;

    public function __construct() {
        parent::__construct();

        $this->_partner_layout = new Zend_Db_Table('partner_layout');
        $this->_partner_desc_history = new Zend_Db_Table('partner_desc_history');
    }

    /*
     * Funkcja pobierajaca partnerów jesli ma wyswietlic w panelu administracyjnym
     * lub tylko tych ktorzy maja byc wyswietleni na stronie glownej.
     */

    public function getPartners($onlyActive) {
        $select = $this->_db->select();
        $select->from('partner_layout', array('id', 'partner_name', 'partner_key', 'partner_desc', 'active'))
                ->order('order');
        if ($onlyActive == 1) {
            $select->where('active = 1');
        }
        $partners = $this->_db->fetchAll($select);

        $config = Zend_Registry::get('config');
        $dbsklep = new Zend_Db_Adapter_Pdo_Mysql($config['dbsklep']['params']);

        if (!empty($partners)) {
            foreach ($partners as $i => $partner) {
                $klucz = $partner['partner_key'];
                $www_sklepu = $dbsklep->fetchOne(
                        $dbsklep->select()
                                ->from('partnerzy', array('www_sklepu'))
                                ->where('klucz = ?', $klucz)
                );
                $partners[$i]['www_sklepu'] = $www_sklepu;
            }
        }

        return $partners;
    }

    public function addPartner($nameText, $descText, $keyText) {
        /*
         * Sprawdzenie czy wartosci zostaly wpisane.
         */
        if (isset($nameText) && isset($descText) && isset($keyText)) {


            $row = $this->_partner_layout->createRow();
            $row->partner_name = $nameText;
            $row->partner_desc = $descText;
            $row->partner_key = $keyText;
            $insert_id = $row->save();
            $row->order = $insert_id;
            $row->save();
            $output = array(
                "id" => $insert_id,
                "name" => $nameText,
                "desc" => $descText,
                "key" => $keyText,
                "action" => 'adding'
            );
        } else {
            $output = array(
                "Error" => "PHP Error: nie wpisano wszystkich wartości"
            );
        }
        return $output;
    }

    public function deletePartner($id) {
        $this->_db->delete('partner_layout', array('id = ?' => (int) $id));
        $this->_db->delete('partner_desc_history', array('partner_id = ?' => (int) $id));
    }

    public function editPartner($id, $nameText, $descText, $keyText) {
        $data = array(
            'partner_name' => $nameText,
            'partner_desc' => $descText,
            'partner_key' => $keyText,
        );
        /*
         * Wyciagniecie z bazy opisu. Jeśli nastąpiła jego zmiana przez administratora
         * to stary opis zostanie zapisany do bazy partner_desc_history.
         */
        $select = $this->_db->select();
        $select->from('partner_layout', array('partner_desc'))
                ->where('id = ?', $id);
        $description = $this->_db->fetchAll($select);
        if ($descText != $description[0]['partner_desc']) {
            $row = $this->_partner_desc_history->createRow();
            $row->partner_id = $id;
            $row->partner_name = $nameText;
            $row->partner_desc = $description[0]['partner_desc'];
            $row->save();
        }
        /*
         * Upadate wartości w bazie po edycji.
         */
        $this->_db->update('partner_layout', $data, array('id = ?' => (int) $id));
        $output = array(
            "id" => $id,
            "name" => $nameText,
            "desc" => $descText,
            "key" => $keyText,
            "action" => 'editing'
        );
        return $output;
    }

    public function orderPartner($idOrder) {
        $i = 1;
        foreach ($idOrder as $item) {
            $data = array(
                'order' => $i
            );
            $this->_db->update('partner_layout', $data, array('id = ?' => $item));
            $i++;
        }
    }

    public function activePartner($id, $check) {
        $data = array(
            'active' => $check,
        );
        $this->_db->update('partner_layout', $data, array('id = ?' => $id));
    }

    public function keycheckPartner($keyText) {
        $select = $this->_db->select();
        $select->from('partner_layout', array('partner_key'))
                ->where('partner_key = ?', $keyText);
        $partners = $this->_db->fetchAll($select);
        if (empty($partners)) {
            $output = true;
        } else {
            $output = false;
        }
        return $output;
    }

    public function partnerHistory() {
        $select = $this->_db->select();
        $select->from('partner_desc_history', array('partner_name', 'partner_id'))
                 ->group('partner_name');
        $partner = $this->_db->fetchAll($select);
        $i = 0;
        $partnerDescription = array();
        
        foreach($partner as $p) {
            $select = $this->_db->select();
            $select->from('partner_desc_history', array('partner_desc', 'id'))
                    ->where('partner_name = ?', $p['partner_name']);
            $partnerDescription[$i] = $this->_db->fetchAll($select);
            $i++;
        }
        $output = array(
            $partner,
            $partnerDescription
            
        );

        //die(var_dump($output));
        return $output;
        
    }
    
    public function descHistory($partner_id, $id, $new_desc) {
        $select = $this->_db->select();
        $select->from('partner_layout', array('partner_desc'))
                ->where('id = ?', $partner_id);
        $old_desc = $this->_db->fetchAll($select);
        
        $data = array(
            'partner_desc' => $new_desc
        );
        $this->_db->update('partner_layout', $data, array('id = ?' => (int) $partner_id));

        $this->_db->update('partner_desc_history', $old_desc[0], array('id = ?' => (int) $id));
        
        $output = array(
            $partner_id,
            $id,
            $old_desc[0]
        );
        return $output;
         
    }
}
