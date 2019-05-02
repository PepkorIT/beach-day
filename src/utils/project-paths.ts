import * as path from 'path';

// 1 more ../ for dist directory
const root = path.join(__dirname, '../../../');

export const ProjectPaths = {
    root     : root,
    templates: path.join(root, 'src/templates'),
};
