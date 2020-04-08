module.exports = {
    css: {
        loaderOptions: {
            scss: {
                prependData: `@import "~@/index.scss";`,
            },
        },
    },
};
