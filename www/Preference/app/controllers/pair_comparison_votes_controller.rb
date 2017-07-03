class PairComparisonVotesController < ApplicationController

def new
  @pair_comparison_vote = PairComparisonVote.new

  if session[:current_index].nil? then
    session[:current_index] = 0
    session[:sequence_voted] = Array.new
  end

  seen = true
  loop_counter = 0
  while seen && loop_counter <= 4
    @pair = Pair.order(:count).first
    @pair = Pair.where(:count => @pair.count).shuffle.first
    seen = false
    session[:sequence_voted].each do |voted|
      if(voted[0] == @pair.a && voted[1] == @pair.b)
        seen = true
      end
    end

    if !seen || loop_counter > 10
      @pair.count = @pair.count + 1
      @pair.save
      session[:sequence_voted].push([@pair.a, @pair.b])
    else
      loop_counter = loop_counter + 1
    end
  end

  @pair_comparison_vote.a = @pair.a
  @pair_comparison_vote.b = @pair.b

  @content_A = Content.find(@pair.a)
  @content_B = Content.find(@pair.b)

end


def create
  @pair_comparison_vote = PairComparisonVote.new(params[:pair_comparison_vote].permit(:vote, :a, :b))
  @pair_comparison_vote.user_id = session[:u_id];
  @pair_comparison_vote.a = session[:sequence_voted].last[0]
  @pair_comparison_vote.b = session[:sequence_voted].last[1]


  respond_to do |format|
    if @pair_comparison_vote.save

      if session[:current_index] + 1 < 12
        session[:current_index] = session[:current_index] + 1;
        format.html { redirect_to :controller=> 'pair_comparison_votes', :action=>'new' }
      else
        format.html { redirect_to :controller=> 'done', :action=>'done' }
      end
    else
      format.html { render action: "new" }
    end
  end

end


def getIndex(i,j,w)
  return i*w+j;
end


def pair_comparison_shuffle(list)
  result = Array.new

  pc_matrix = Array.new(list.length)

  w = Math.sqrt(list.length);
  d = 0;
  ii = -1;
  jj = 0;
  layer = 0;
  list.each_with_index do |value1,index|

    if(d == 0)
      if(ii < w-1-layer)
        ii = ii + 1;
      else
        d = 1;
      end
    end

    if(d == 1)
      if(jj < w-1-layer)
        jj = jj + 1;
      else
        d = 2;
      end
    end

    if(d == 2)
      if(ii > 0+layer)
        ii = ii -1;
      else
        d = 3;
      end
    end

    if(d == 3)
      if(jj > 1+layer)
        jj = jj -1;
      else
        d = 0;
        ii = ii + 1;
        layer = layer + 1;
      end
    end

    pc_matrix[ii*w+jj] = index;
  end

  for l in 0..(w-1)
    for i in 0..(w-1)
      for j in (i+1)..(w-1)
        result.push([list[pc_matrix[l*w+i]].id, list[pc_matrix[l*w+j]].id]);
      end
    end
  end

  for c in 0..(w-1)
    for i in 0..(w-1)
      for j in (i+1)..(w-1)
        result.push([list[pc_matrix[i*w+c]].id, list[pc_matrix[j*w+c]].id]);
      end
    end
  end

  result = result.shuffle

  return result
end

def combin(list)
  result = Array.new

  list.each_with_index do |value1,index|
    list.slice(index+1,list.length-index-1).each do |value2|
      result.push([value1.id, value2.id])
    end
  end

  return result

end



end
