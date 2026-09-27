import fs from 'fs';
import path from 'path';

function checkImports(dir) {
    let errors = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            errors = errors.concat(checkImports(fullPath));
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                const importPath = match[1];
                if (importPath.startsWith('.')) {
                    // It's a relative import
                    let targetPath = path.resolve(path.dirname(fullPath), importPath);
                    
                    // Try to resolve extension if missing
                    if (!fs.existsSync(targetPath)) {
                        if (fs.existsSync(targetPath + '.js')) targetPath += '.js';
                        else if (fs.existsSync(targetPath + '.jsx')) targetPath += '.jsx';
                        else if (fs.existsSync(targetPath + '.css')) targetPath += '.css';
                        else if (fs.existsSync(targetPath + '.scss')) targetPath += '.scss';
                    }

                    // Check exact case of the final basename
                    if (fs.existsSync(targetPath)) {
                        const dirName = path.dirname(targetPath);
                        const baseName = path.basename(targetPath);
                        const actualFiles = fs.readdirSync(dirName);
                        if (!actualFiles.includes(baseName)) {
                            errors.push(`Case mismatch in ${fullPath}: imported '${importPath}', actual file is in '${dirName}' but casing differs from '${baseName}'`);
                        }
                    } else {
                        // Might be a directory import looking for index.js
                        if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
                            // ignore for now
                        } else {
                           errors.push(`File not found: ${targetPath} imported in ${fullPath}`);
                        }
                    }
                }
            }
        }
    }
    return errors;
}

const errs = checkImports(path.join(process.cwd(), 'src'));
if (errs.length > 0) {
    console.log("ERRORS FOUND:");
    errs.forEach(e => console.log(e));
} else {
    console.log("No case mismatches found!");
}
