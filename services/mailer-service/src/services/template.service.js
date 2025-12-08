const templates = require('../templates/emailTemplates');

exports.generateEmailContent = (templateName, data) => {
    if (!templates[templateName]) {
        throw new Error(`Template '${templateName}' not found`);
    }
    return templates[templateName](data);
};
