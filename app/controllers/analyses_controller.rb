# frozen_string_literal: true

class AnalysesController < ApplicationController
  before_action :set_mda, only: [:show, :edit, :update, :destroy]

  # GET /mdas
  def index
    @mdas = policy_scope(Analysis).roots
  end

  # GET /mdas/1
  def show
  end

  # GET /mdas/new
  def new
    @mda = Analysis.new
    authorize @mda
  end

  # GET /mdas/1/edit
  def edit
  end

  # POST /mdas
  def create
    if params[:cancel_button]
      redirect_to mdas_url, notice: "Analysis creation cancelled."
    else
      if params[:mda_id]
        @orig_mda = Analysis.find(params[:mda_id])
        authorize @orig_mda
        @mda = @orig_mda.create_copy!
      else
        @mda = Analysis.new(mda_params)
        authorize @mda
      end
      if @mda.save
        @mda.set_owner(current_user)
        if @mda.disciplines.nodes.empty?
          redirect_to edit_mda_url(@mda)
        else
          redirect_to mda_url(@mda), notice: "Analysis #{@mda.name} was successfully created."
        end
      elsif params[:mda_id]
        redirect_to mda_url(Analysis.find(params[:mda_id])), error: "Something went wrong while copying #{@orig_mda.name}."
      else
        @import = params[:import]
        render :new
      end
    end
  end

  # PATCH/PUT /mdas/1
  def update
    if @mda.update(mda_params)
      redirect_to mda_url(@mda), notice: "Analysis #{@mda.name} was successfully updated."
    else
      render :edit
    end
  end

  # DELETE /mdas/1
  def destroy
    if @mda.parent
      redirect_to mdas_url, alert: "Can not delete nested analysis (you should delete parent first)."
    else
      unless @mda.operations.blank? # remove operations in reverse order first
        @mda.operations.reverse_each { |ope| ope.destroy! }
      end
      @mda.destroy!
      redirect_to mdas_url, notice: "Analysis #{@mda.name} was successfully deleted."
    end
  rescue Discipline::ForbiddenRemovalError => exc
    redirect_to mdas_url, alert: "Can not delete analysis #{@mda.name}, reason: "+exc.message
  rescue Operation::ForbiddenRemovalError => exc
    redirect_to mdas_url, alert: "Can not delete analysis #{@mda.name}, reason: "+exc.message
  end

  private
    def set_mda
      @mda = Analysis.find(params[:id])
      authorize @mda
    end

    def mda_params
      params.require(:analysis)
        .permit(:name, :public)
    end
end
