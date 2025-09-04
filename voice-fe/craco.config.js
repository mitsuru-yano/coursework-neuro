const path = require('path')

const resolvePath = (p) => path.resolve(__dirname, p)

module.exports = {
    webpack: {
        alias: {
            '@layout': resolvePath('./src/components/layout'),
            '@ui': resolvePath('./src/components/ui'),
            '@modules': resolvePath('./src/components/modules'),
            '@assets': resolvePath('./src/assets'),
            '@services': resolvePath('./src/services'),
            '@pages': resolvePath('./src/pages'),
            '@context': resolvePath('./src/context'),
            '@styles': resolvePath('./src/styles'),
            '@hooks': resolvePath('./src/hooks'),
            '@utils': resolvePath('./src/utils'),
        },
    },
}
