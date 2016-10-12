<?php
namespace Craft;

/**
 * The MainController class is a controller that handles the plugin core functionality.
 *
 * @author    Webtexttool
 * @see       http://webtexttool.com
 * @package   plugins.webtexttool.controllers
 * @since     1.0
 */

class WebtexttoolController extends BaseController
{

    /**
     * Save Record
     *
     * Create or update an existing record, based on POST data
     */
    public function actionSaveRecord()
    {

        $this->requirePostRequest();

        if ($id = craft()->request->getPost('recordId')) {
            $model = craft()->webtexttool->getRecordById($id);
        } else {
            $model = craft()->webtexttool->newRecord($id);
        }

        $model->entryId = craft()->request->getPost('entryId');
        $model->wttKeywords = craft()->request->getPost('wtt_keyword');
        $model->wttLanguage = craft()->request->getPost('wttLanguage');

        if ($model->validate()) {
            craft()->webtexttool->saveRecord($model);
        }
    }
}