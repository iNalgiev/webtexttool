function getHtmlContent (pageContent, title, description, permalink, keyword) {
    if (!/<html>/i.test(pageContent)) {
        var html = '<html><head>';
        if (title != null)
            html = html + '<title>' + title + '</title>';
        if (description != null)
            html = html + '<meta name="description" content="' + description + '">';
        if (keyword != null)
            html = html + '<meta name="keywords" content="' + keyword + '">';
        if (permalink != null)
            html = html + '<meta name="url" content="' + permalink + '">';
        html = html + '</head><body>' + pageContent + '</body></html>';
        return html;
    } else {
        return pageContent;
    }
}