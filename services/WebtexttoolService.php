<?php

namespace Craft;

/**
 * Webtexttool Core Service
 *
 * Provides a consistent API for our plugin to access the database
 */
class WebtexttoolService extends BaseApplicationComponent
{
    /**
     * Get a new blank record
     *
     * @param  array $attributes
     * @return Webtexttool_CoreModel
     */
    public function newRecord($attributes = array())
    {
        $model = new Webtexttool_CoreModel();
        $model->setAttributes($attributes);

        return $model;
    }

    /**
     * Get a new blank record
     *
     * @param  array $attributes
     * @return Webtexttool_UserModel
     */
    public function newUserRecord($attributes = array())
    {
        $model = new Webtexttool_UserModel();
        $model->setAttributes($attributes);

        return $model;
    }

    /**
     * Returns all records.
     *
     * @return array
     */
    public function getAllRecords()
    {
        $records = Webtexttool_CoreRecord::model()->findAll(array());

        return Webtexttool_CoreModel::populateModels($records);
    }

    /**
     * Returns a record by its ID.
     *
     * @param int $recordId
     *
     * @return Webtexttool_CoreRecord
     */
    public function getRecordById($recordId)
    {
        $coreRecord = Webtexttool_CoreRecord::model()->findById($recordId);

        if ($coreRecord) {
            return Webtexttool_CoreModel::populateModel($coreRecord);
        }
    }

    /**
     * Returns a record by its entry ID.
     *
     * @param int $entryId
     *
     * @return Webtexttool_CoreModel
     */
    public function getRecordByEntryId($entryId)
    {
        $coreRecord = Webtexttool_CoreRecord::model()->findByAttributes(array('entryId' => $entryId));

        if ($coreRecord) {
            return Webtexttool_CoreModel::populateModel($coreRecord);
        }
    }

    /**
     * Returns a record by its record ID.
     *
     * @param int $userRecordId
     *
     * @return Webtexttool_UserModel
     */
    public function getAccessTokenById($userRecordId)
    {
        $userRecord = Webtexttool_UserRecord::model()->findById($userRecordId);

        if ($userRecord) {
            return Webtexttool_UserModel::populateModel($userRecord);
        }
    }

    /**
     * Returns a Webtexttool User by user ID.
     *
     * @param int $userId
     *
     * @return Webtexttool_UserModel
     */
    public function getAccessTokenByUserId($userId)
    {
        $userRecord = Webtexttool_UserRecord::model()->findByAttributes(array('userId' => $userId));

        if ($userRecord) {
            return Webtexttool_UserModel::populateModel($userRecord);
        }
    }

    /**
     * Save a new or existing record back to the database.
     *
     * @param Webtexttool_CoreModel $model
     * @return bool
     * @throws Exception
     */
    public function saveRecord(Webtexttool_CoreModel &$model)
    {
        if ($id = $model->getAttribute('id')) {
            $wttCoreRecord = Webtexttool_CoreRecord::model()->findById($id);
            if (!$wttCoreRecord) {
                throw new Exception(Craft::t('Can\'t find record with ID "{id}"', array('id' => $id)));
            }
        } else {
            $wttCoreRecord = new Webtexttool_CoreRecord();
        }

        if ($model->validate()) {
            $attributes = array(
                'entryId' => $model->entryId,
                'wttKeywords' => $model->wttKeywords,
                'wttDescription' => $model->wttDescription,
                'wttLanguage' => $model->wttLanguage,
            );

            foreach ($attributes as $k => $v) {
                $wttCoreRecord->setAttribute($k, $v);
            }

            if ($wttCoreRecord->save()) {
                // update id on model (for new records)
                $model->setAttribute('id', $wttCoreRecord->getAttribute('id'));
                return true;
            } else {
                $model->addErrors($wttCoreRecord->getErrors());
                return false;
            }
        }
    }

    /**
     * Save a new or existing access token back to the database.
     *
     * @param Webtexttool_UserModel $model
     * @return bool
     * @throws Exception
     */
    public function saveAccessToken(Webtexttool_UserModel &$model)
    {
        if ($id = $model->getAttribute('id')) {
            $wttUserRecord = Webtexttool_UserRecord::model()->findById($id);
            if (!$wttUserRecord) {
                throw new Exception(Craft::t('Can\'t find record with ID "{id}"', array('id' => $id)));
            }
        } else {
            $wttUserRecord = new Webtexttool_UserRecord();
        }

        if ($model->validate()) {
            $attributes = array(
                'userId' => $model->userId,
                'accessToken' => $model->accessToken,
            );

            foreach ($attributes as $k => $v) {
                $wttUserRecord->setAttribute($k, $v);
            }

            if ($wttUserRecord->save()) {
                // update id on model (for new records)
                $model->setAttribute('id', $wttUserRecord->getAttribute('id'));
                return true;
            } else {
                $model->addErrors($wttUserRecord->getErrors());
                return false;
            }
        }
    }
}
