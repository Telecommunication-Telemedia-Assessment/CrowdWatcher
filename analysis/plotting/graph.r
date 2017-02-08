library(ggplot2)
library(plyr)

#cbbPalette <- c("#000000", "#009E73", "#e79f00", "#9ad0f3", "#0072B2", "#D55E00", "#CC79A7", "#F0E442")
# plot aux data
# dimensions: gender,age,screen,userId,windowSize,videoSize,youtubeQuality,qoeExperience,videoConsumption,vision,glasses
plotaux <- function(file, dimension, label=dimension, title="plot", toFile=FALSE) {
    data <- read.csv(file=file, header=TRUE, sep=",")

    val <- data[[dimension]]
    dat <- data.frame(val, stringsAsFactors=F)
    head(dat)
    dat[dat==""] <- NA
    #dat[dat$val < 
    dat <- na.omit(dat)
    print(count(dat$val))

    p <- ggplot(dat, aes(val, fill=val))
    p <- p + ggtitle(title)
    p <- p + geom_bar(color="#777777")
    p <- p + scale_fill_brewer()
    #p <- p + scale_fill_grey()
    p <- p + theme(text = element_text(size=32))
    p <- p + xlab(label)
    p <- p + guides(fill=FALSE)
    #p <- p + guides(fill=guide_legend(title=NULL))
    #p <- p + scale_fill_manual(values=cbbPalette)

    if (toFile) png(filename=paste0(dimension, ".png"), width=2560, height=1440)
    p
}

# plot a single csv from the fitdir
plotfit <- function(file) {
    data <- read.csv(file=file, header=TRUE, sep=",")

    user <- rep(file, length(data$frame))
    frame <- data$frame
    val <- data$x
    err <- data$CI_x
    distraction <- data$distraction

    dat <- data.frame(user, frame, val, err, distraction, stringsAsFactors=F)

    p <- ggplot(dat, aes(x=frame, y=val, group=user, colour=user))
    p <- p + geom_errorbar(aes(ymin=val - err/2, ymax=val + err/2), width=5)
    p <- p + geom_line()
    p <- p + geom_point(data=subset(dat, dat$distraction == 1), aes(x=frame, y=val, group=distraction))
    p
}

# plot all fit data in the fitDir
plotfits <- function(fitDir) {
    files <- list.files(fitDir)
    nfiles <- length(files)
    a <- lapply(files, function(file) read.csv(file=paste0(fitDir, file), header=TRUE, sep=","))

    participant <- unlist(sapply(1:nfiles, function(i) rep(files[i], length(a[[i]]$frame))))
    frame <- unlist(lapply(a, function(data) data$frame))
    val <- unlist(lapply(a, function(data) data$x))
    err <- unlist(lapply(a, function(data) data$CI_x))
    distraction <- unlist(sapply(a, function(data) data$distraction))

    dat <- data.frame(participant, frame, val, err, distraction, stringsAsFactors=F)

    p <- ggplot(dat, aes(x=frame, y=val, group=participant, colour=participant))
    p <- p + geom_errorbar(aes(ymin=val - err/2, ymax=val + err/2), width=5)
    p <- p + geom_line()
    p <- p + geom_point(data=subset(dat, dat$distraction == 1), aes(x=frame, y=val, group=distraction))
    p <- p + coord_cartesian(ylim = c(-10000, 10000))
    p
}
