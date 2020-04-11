module.exports = {
    css: {
        loaderOptions: {
            scss: {
                prependData: `@import "~@/index.scss";`
            }
        }
    },
    publicPath: process.env.NODE_ENV === "production" ? "/lawirant/" : "/"
};
