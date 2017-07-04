function SalMap2Fix = getSalMap(filename)
% filename = 'fix.csv';

distance = .55;
dpi = 72;
inchesPerMeter = 39.370;
fheight = 1080;
fwidth = 1920;


% Internal constants
scaling = .1;
mxFr = 0;


%% Read the CSV file
fileId3 = fopen(filename, 'r');
for k=1:1
    % Skip the first line which contains the header
    tline = fgets(fileId3);
end

fixDataRaw = textscan(fileId3,'%s', 'delimiter', ',');

fclose(fileId3);

%% Reorder the data
fixData = cell(7,1);
i = 1;
while i < length(fixDataRaw{1})
    for k = 1:6 
        fixData{k} = [fixData{k}; fixDataRaw{1}(i)];
        i = i + 1;
    end
    
    if i <= length(fixDataRaw{1})
        if((str2double(fixDataRaw{1}(i))) == (str2double(fixData{1}{end}) + 1))
            fixData{7} = [fixData{7}; ' '];
        else
            fixData{7} = [fixData{7}; fixDataRaw{1}(i)];
            i = i + 1;
        end
    end
end


%% Generate the saliency maps

mxFr = max(mxFr, length(fixData{1}));

SalMap2Fix = zeros(fheight,fwidth, round(mxFr));

for frIdx = 1:length(fixData{1})
    tmpSal = zeros(fheight,fwidth);
    tmpSal(min(fheight,max(1,fheight-uint32(str2double(fixData{4}(frIdx))))), min(fwidth,max(1,fwidth-uint32(str2double(fixData{2}(frIdx)))))) = 1;
    if(~isnan(str2double(fixData{3}(frIdx))))
        tmpSal = conv2(tmpSal, fspecial('gaussian', [401 401], scaling * max([str2double(fixData{3}(frIdx)) str2double(fixData{4}(frIdx))])), 'same');
        tmpSal = tmpSal / max(tmpSal(:));
    end

    SalMap2Fix(:,:,frIdx) = SalMap2Fix(:,:,frIdx) + tmpSal;
end




lambda = tan(1 / 180 * pi) * distance * inchesPerMeter * dpi;

kernel = fspecial('gaussian', [1 1001], lambda);

for frIdx = 1:mxFr
    SalMap2Fix(:,:,frIdx) = conv2(SalMap2Fix(:,:,frIdx), kernel, 'same');
    SalMap2Fix(:,:,frIdx) = conv2(SalMap2Fix(:,:,frIdx), kernel', 'same');
end

for frIdx = 1:mxFr
    SalMap2Fix(:,:,frIdx) = SalMap2Fix(:,:,frIdx) / max(max(SalMap2Fix(:,:,frIdx)));
end





