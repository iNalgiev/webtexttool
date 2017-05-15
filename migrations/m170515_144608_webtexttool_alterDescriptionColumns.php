<?php
namespace Craft;

class m170515_144608_webtexttool_alterDescriptionColumns extends BaseMigration
{

    /**
     * Any migration code in here is wrapped inside of a transaction.
     *
     * @return bool
     */
    public function safeUp()
    {

        $this->alterColumn('webtexttool_core', 'wttDescription', array(ColumnType::Varchar, 'maxLength' => 1024));
        $this->alterColumn('webtexttool_user', 'accessToken', array(ColumnType::Varchar, 'maxLength' => 1024));

        return true;
    }
}