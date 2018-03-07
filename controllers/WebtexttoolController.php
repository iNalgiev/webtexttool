<?php
namespace Craft;

/**
 * The MainController class is a controller that handles the plugin core functionality.
 *
 * @author    Webtexttool
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
        $model->wttDescription = craft()->request->getPost('wtt_description');
        $model->wttLanguage = craft()->request->getPost('wtt_language');
        $model->wttSynonyms = craft()->request->getPost('wtt_synonym_tags');

        if ($model->validate()) {
            craft()->webtexttool->saveRecord($model);
        }
    }

    public function actionGetUrlWithToken()
    {
        $this->requireAjaxRequest();

        $params = array('entryId' => craft()->request->getPost('entryId'), 'locale' => craft()->request->getPost('locale'));

        $status = array('status' => craft()->request->getPost('status'));

        if($status['status'] != "live") {
            craft()->tokens->deleteExpiredTokens();

            $token = craft()->tokens->createToken(array('action' => 'entries/viewSharedEntry', 'params' => $params));
            $url = UrlHelper::getUrlWithToken(craft()->request->getPost('url'), $token);
        } else {
            $url = craft()->request->getPost('url');
        }

        $this->returnJson(array('url' => $url));
    }

    public function actionSaveAccessToken()
    {
        $this->requireAjaxRequest();

        $response = [
            'message' => 'Something went wrong'
        ];

        if ($id = craft()->request->getPost('userRecordId')) {
            $model = craft()->webtexttool->getAccessTokenById($id);
        } else {
            $model = craft()->webtexttool->newUserRecord($id);
        }

        $model->userId = craft()->request->getPost('userId');
        $model->accessToken = craft()->request->getPost('accessToken');

        if ($model->validate()) {
            $response = [
                'message' => 'success'
            ];

            craft()->webtexttool->saveAccessToken($model);
        }

        $this->returnJson($response);
    }

    public function actionSaveContentQualitySettings() {
        $this->requireAjaxRequest();

        $params = array('data' => craft()->request->getPost('data'), 'entryId' => craft()->request->getPost('entryId'), 'recordId' => craft()->request->getPost('recordId'));
        $entryId = $params['entryId'];

        if($entryId && $params['recordId']) {
            $model = craft()->webtexttool->getRecordByEntryId($entryId);
        } else {
            $model = new Webtexttool_CoreModel();
        }

        $model->entryId = $entryId;
        $model->wttContentQualitySettings = $params['data'];

        if ($model->validate()) {

            $response = craft()->webtexttool->saveRecord($model);

            $this->returnJson($response);
        }

        $this->returnJson(array('message' => 'failed'));
    }

    public function actionSaveContentQualitySuggestions() {
        $this->requireAjaxRequest();

        $params = array('data' => craft()->request->getPost('data'), 'entryId' => craft()->request->getPost('entryId'), 'recordId' => craft()->request->getPost('recordId'));
        $entryId = $params['entryId'];

        if($entryId && $params['recordId']) {
            $model = craft()->webtexttool->getRecordByEntryId($entryId);
        } else {
            $model = new Webtexttool_CoreModel();
        }

        $model->entryId = $entryId;
        $model->wttContentQualitySuggestions = $params['data'];

        if ($model->validate()) {
            $response = [
                'message' => 'success',
            ];

            craft()->webtexttool->saveRecord($model);

            $this->returnJson($response);
        }

        $this->returnJson(array('message' => 'failed'));
    }
}