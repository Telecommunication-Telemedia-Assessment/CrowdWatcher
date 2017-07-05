% --------------------------------------------------------------------------------------------------------- %
% --- POST-PROCESSING OF HEAD POSE TIME SERIES OBTAINED FROM CROWDWATCHER TO EXTRACT ENGAGEMENT METRICS ---
%
% Engagement metrics are defined as follows:
%
%  - Percent of face detection:      A face is considered to be correctly detected in a given frame 
%                                    when its associated confidence value is above 0.5. This metric 
%                                    computes the percent of frames in the video where the face was 
%                                    detected according to this criteria. Low values of this metric 
%                                    generally mean that the image quality was not good enough to 
%                                    perform face detection (bad illumination, low resolution, etc.).
%  - Percent of attention focused.   The approximate immediate field of view of a human eye is in the 
%                                    range of -30º/30º for yaw and -25º/30º for pitch. Using these 
%                                    values as thresholds, it can be determined for each frame, 
%                                    whether the participant was focusing his attention towards the 
%                                    screen or not. This metric computes the percent of frames in the 
%                                    video in which the participant was focused.
%  - Percent of large displacements. Displacement in X, Y and Z directions (in millimeters) indicates 
%                                    the difference in terms of position with respect to each time  
%                                    series' mean. A large displacement is considered to happen in a  
%                                    given frame if its value in any of the 3 axes is above 100mm. 
%                                    This metric provides the percentage of frames in which there is 
%                                    a large displacement.
%
% The following inputs/outputs are defined: 
%
%  - input_path:    Folder containing the .txt files with head pose raw data,
%                   as exported by CrowdWatcher (one .txt file per analyzed video clip).
%  - output_path:   Folder where engagement metrics will be saved. A .csv
%                   file containing the metrics extracted for each video will be created
%                   (one raw per analyzed video). One plot will be also built per video to
%                   visualize engagement time series over time.
% --------------------------------------------------------------------------------------------------- %



%% Input and output paths
input_path = './head_pose_features/';
output_path = './engagement_metrics/';


%% Parameters used to discard disengaged users

conf_thr = 0.5; % confidence in facial detection
lower_pitch_thr = -25; % minimum pitch angle allowed
upper_pitch_thr = 30; % maximum pitch angle allowed
lower_yaw_thr = -30; % minimum yaw angle allowed
upper_yaw_thr = 30; % maximum yaw angle allowed
displacement_thr = 100; % Maximum displacement (in mm) allowed in X, Y or Z directions


%% Write header line in the CSV results file

fid = fopen([output_path, 'engagement_metrics.csv'], 'w');
fprintf(fid, 'video_name,%%face_detected,%%large_displacement,%%attention_focused\n');


%% Go on with videos engagement analysis!

dirlist = dir(input_path); 

for i = 1:length(dirlist)
    
    file = dirlist(i);
    
    if(~strcmp(file.name,'.') && ~strcmp(file.name,'..'))
            
            if( ~isempty(strfind(file.name,'.txt')) )
                         
                data = csvread(strcat(input_path, file.name),1,0);
                display(strcat('Analyzing: ', input_path, file.name))
                
                figure; 
                num_frames = size(data,1);

                % Determine whether the face was detected or not
                subplot(3,1,1);
                plot(data(:,2)', (data(:,3))', 'k', 'LineWidth', 1); hold on;
                hline_face = refline([0 conf_thr]); hline_face.Color = 'k'; hline_face.LineStyle = ':'; hold off;
                xlabel('t(s)'); ylabel('Confidence'); axis([0 data(num_frames,2) 0 1]); title('Face detection');
                
                % Exclude from time series frames where face was not detected (NaN values are put instead in these frames) 
                count_face_detected = 0;
                for j = 1:num_frames
                    if(data(j,3) < conf_thr)
                        data(j,5:10) = NaN;    
                    else
                        count_face_detected = count_face_detected + 1;
                    end
                end
                
                % Displacement in X, Y and Z
                subplot(3,1,2);
                bias_x = mean(data(:,5)','omitnan');
                bias_y = mean(data(:,6)','omitnan');
                bias_z = mean(data(:,7)','omitnan');
                unbiased_Dx_ts = abs((data(:,5))'-bias_x);
                unbiased_Dy_ts = abs((data(:,6))'-bias_y);
                unbiased_Dz_ts = abs((data(:,7))'-bias_z);
                plot(data(:,2)', unbiased_Dx_ts, 'r', 'LineWidth', 1); hold on;
                plot(data(:,2)', unbiased_Dy_ts, 'b', 'LineWidth', 1); 
                plot(data(:,2)', unbiased_Dz_ts, 'Color', [0,0.7,0], 'LineWidth', 1); 
                hline_D = refline([0 displacement_thr]); hline_D.Color = 'k'; hline_D.LineStyle = ':'; hold off;
                xlabel('t(s)'); ylabel('D(mm)'); axis([0 data(num_frames,2) 0 200]); 
                legend({'D_x','D_y','D_z'},'FontSize',6,'Orientation','vertical'); 
                title('Displacement'); 
                
                % Head pose (yaw and pitch) values
                subplot(3,1,3);
                bias_pitch = mean(data(:,8)','omitnan');
                bias_yaw = mean(data(:,9)','omitnan');
                unbiased_pitch_ts = (data(:,8))' - bias_pitch;
                unbiased_yaw_ts = (data(:,9))' - bias_yaw;
                plot(data(:,2)', unbiased_pitch_ts, 'r', 'LineWidth', 1); hold on;
                plot(data(:,2)', unbiased_yaw_ts, 'b', 'LineWidth', 1);
                hline_pitch_lower = refline([0 lower_pitch_thr]); hline_pitch_lower.Color = 'r'; hline_pitch_lower.LineStyle = ':'; 
                hline_pitch_upper = refline([0 upper_pitch_thr]); hline_pitch_upper.Color = 'r'; hline_pitch_upper.LineStyle = ':';
                hline_yaw_lower = refline([0 lower_yaw_thr]); hline_yaw_lower.Color = 'b'; hline_yaw_lower.LineStyle = ':';
                hline_yaw_upper = refline([0 upper_yaw_thr]); hline_yaw_upper.Color = 'b'; hline_yaw_upper.LineStyle = ':'; hold off;
                xlabel('t(s)'); ylabel('Angle(°)'); axis([0 data(num_frames,2) -50 50]); 
                legend({'yaw','pitch'},'FontSize',6,'Orientation','vertical'); 
                title('Head pose'); 
                
                % Compute stats
                percent_face_detected = count_face_detected / num_frames;
                count_attention_focused = 0;
                count_displacement = 0;
                for j = 1:num_frames
                    if( (~isnan(unbiased_pitch_ts(1,j))) && (unbiased_pitch_ts(1,j)<upper_pitch_thr) && (unbiased_pitch_ts(1,j)>lower_pitch_thr) ...
                                            && (unbiased_yaw_ts(1,j)<upper_yaw_thr) && (unbiased_yaw_ts(1,j)>lower_yaw_thr) )
                        count_attention_focused = count_attention_focused + 1;
                    end
                    if( (~isnan(unbiased_Dx_ts(1,j))) && ...
                            ((unbiased_Dx_ts(1,j)>displacement_thr)||(unbiased_Dy_ts(1,j)>displacement_thr)||(unbiased_Dz_ts(1,j)>displacement_thr)) )
                        count_displacement = count_displacement + 1;
                    end
                    
                end
                percent_attention_focused = count_attention_focused / num_frames;
                percent_displacement = count_displacement / num_frames;
                       
                % Write resulting metrics in a csv and visualize time series
                fprintf(fid, '%s,%6.3f,%6.3f,%6.3f\n', file.name, ....
                    percent_face_detected, ...
                    percent_displacement, ...
                    percent_attention_focused );
                saveas(gcf, strcat(output_path,'/',file.name(1:size(file.name,2)-4)), 'png');
                
            end     
    end
end

fclose(fid);

