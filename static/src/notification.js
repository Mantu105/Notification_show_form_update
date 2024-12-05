/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { FormController } from '@web/views/form/form_controller';
import { jsonrpc } from "@web/core/network/rpc_service";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);
        this.notification = useService("notification");
    },

    async onRecordSaved(record) {
        const message = "Record updated successfully.";
        try {
            const modelName = await this.getModelName(this.props.resModel);
            const displayName = await this.getDisplayName(modelName);
            const finalMessage = _t("%s %s").replace('%s', displayName).replace('%s', message);
            this.notification.add(finalMessage, {
                title: _t("Success"),
                type: "success",
            });
        } catch (error) {
            console.error('Error:', error);
            this.notification.add(_t("Failed to fetch model name."), {
                title: _t("Error"),
                type: "danger",
            });
        }

        return true;
    },

    async getModelName(activeModel) {
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'ir.model',
                method: 'search_read',
                args: [
                    [['model', '=', activeModel]],
                    ['name']
                ],
                kwargs: {}
            });

            console.log('Model name result:', result);
            if (result && result.length) {
                return result[0].name;
            }

            console.warn('Model name not found for:', activeModel);
            return activeModel;
        } catch (error) {
            console.error('Error fetching model name:', error);
            return activeModel;
        }
    },

    async getDisplayName(modelName) {
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'ir.model.data',
                method: 'search_read',
                args: [
                    [['model', '=', modelName]],
                    ['name']
                ],
                kwargs: {}
            });

            if (result && result.length) {
                return result[0].name;
            }

            console.warn('Display name not found for model:', modelName);
            return modelName;
        } catch (error) {
            console.error('Error fetching display name:', error);
            return modelName;
        }
    }
});
