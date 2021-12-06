import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from 'eventemitter2';
import { catchError } from 'rxjs';
import { ApiKeyAuthGuard } from 'src/auth/apiKey.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Event } from 'src/event/event';
import { MyMapEvent } from 'src/event/event-pub-sub';
import { MyLogger } from 'src/logger/logger.service';
import { UserService } from 'src/user/user.service';
import { CreatePinDTO } from './dto/create-pin.dto';
import { CreatePostDTO } from './dto/create-post.dto';
import { FeedDTO } from './dto/feed.dto';
import { PostDTO } from './dto/post.dto';
import { RegionPinsDTO } from './dto/region-pins.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { PostService } from './post.service';

@ApiTags('api/post')
@Controller('api/post')
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly logger: MyLogger,
        private readonly eventEmitter: EventEmitter2
    ) {}

    @Roles(Role.Signed_User)
    @UseGuards(RolesGuard)
    @Get('/myPost/info')
    @ApiOkResponse({ description: '내 테마 정보 불러오기 성공', type: [PostEntity] })
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    async readMyPostInfo(@Req() req: any, @Query('regionId') regionId: string): Promise<PostEntity[]> {
        return await this.postService.readUserPostInfo(req.user.userId, regionId);
    }

    @Roles(Role.Signed_User)
    @UseGuards(RolesGuard)
    @Get('/myPost')
    @ApiOkResponse({ description: '내 테마 불러오기 성공', type: FeedDTO })
    @ApiQuery({ name: 'page', example: 1, required: false })
    @ApiQuery({ name: 'perPage', example: 10, required: false })
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    async readMyPost(@Req() req: any, @Query('page') page: number = 1, @Query('perPage') perPage: number = 10): Promise<FeedDTO> {
        this.logger.debug('userId : ', req.user.userId, ' page : ', page, ' perPage : ', perPage);
        if (page < 1 || perPage < 1) throw new BadRequestException();
        this.eventEmitter.emit(MyMapEvent.POST_MYLISTED, new Event(req.user.userId, null));
        return await this.postService.readUserPost(req.user.userId, page, perPage);
    }

    @Roles(Role.Signed_User)
    @UseGuards(RolesGuard)
    @Get('/savedPost')
    @ApiOkResponse({ description: '저장한 테마 불러오기 성공', type: FeedDTO })
    @ApiQuery({ name: 'page', example: 1, required: false })
    @ApiQuery({ name: 'perPage', example: 10, required: false })
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    async readSavedPost(@Req() req: any, @Query('page') page: number = 1, @Query('perPage') perPage: number = 10): Promise<FeedDTO> {
        this.logger.debug('userId : ', req.user.userId, ' page : ', page, ' perPage : ', perPage);
        if (page < 1 || perPage < 1) throw new BadRequestException();
        this.eventEmitter.emit(MyMapEvent.POST_SAVELISTED, new Event(req.user.userId, null))
        return await this.postService.readSavedPost(req.user.userId, page, perPage);
    }

    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    @Get('/admin')
    async readPostList(@Req() req: any, @Query('regionId') regionId: string, @Query('page') page: number = 0, @Query('perPage') perPage: number = 20) {
        return await this.postService.readPostListInfo(regionId, page, perPage);
    }

    @Roles(Role.Unsigned_User)
    @UseGuards(RolesGuard)
    @Get('/:postId')
    @ApiOkResponse({ description: '테마 불러오기 성공', type: PostDTO })
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer', required: false })
    async readPost(@Req() req: any, @Param('postId') postId: number): Promise<PostDTO> {
        this.logger.debug('userId : ', req.user.userId, 'postId : ', postId);
        const post: PostDTO = await this.postService.readPostDetail(req.user.userId, postId);
        this.eventEmitter.emit(MyMapEvent.POST_READED, new Event(postId, req.user.userId));
        return post;
    }

    @Roles(Role.Unsigned_User)
    @UseGuards(RolesGuard)
    @Get('/feed/:regionId')
    @ApiOkResponse({ description: '피드 불러오기 성공', type: FeedDTO })
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer', required: false })
    @ApiQuery({ name: 'start', example: 10, description: '지금까지 불러온 가장 최근 테마 ID', required: false })
    @ApiQuery({ name: 'end', example: 1, description: '지금까지 불러온 가장 오래된 테마 ID', required: false })
    @ApiQuery({ name: 'perPage', example: 10, required: false })
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    async readRegionPost(@Req() req: any, @Param('regionId') regionId: string, @Query('start') start: number = 0, @Query('end') end: number = 0, @Query('perPage') perPage: number = 10): Promise<FeedDTO> {
        this.logger.debug('userId : ', req.user.userId, 'regionId : ', regionId, 'start : ', start, 'end : ', end, 'perPage : ', perPage)
        if (start < 0 || end < 0 || perPage < 1) throw new BadRequestException();
        this.eventEmitter.emit(MyMapEvent.POST_LISTED, new Event(null, regionId));
        return await this.postService.readRegionPost(req.user.userId, regionId, start, end, perPage);
    }

    @Roles(Role.Signed_User)
    @UseGuards(RolesGuard)
    @Post('/')
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    @ApiCreatedResponse({ description: '테마 생성 완료', type: PostEntity })
    async createPost(@Req() req: any, @Body() post: CreatePostDTO) {
        this.logger.debug('userId : ', req.user.userId, ' post : ', post);
        return await this.postService.createPost(req.user.userId, post);
    }

    @Roles(Role.Signed_User)
    @UseGuards(RolesGuard)
    @Post('/savedPost/:postId')
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    @ApiCreatedResponse({ description: '테마 저장 완료' })
    async savePost(@Req() req: any, @Param('postId') postId: number) {
        this.logger.debug('userId : ', req.user.userId, ' postId : ', postId);
        return await this.postService.savePost(req.user.userId, postId);
    }

    /*
    ** 알고리즘 수정완료
    ** 테스트 완료
    ** one to many join where 알아보기
    */
    @Roles(Role.Signed_User)
    @UseGuards(RolesGuard)
    @Put('/pin')
    @ApiOkResponse({ description: '핀 추가 성공' })
    @ApiQuery({ name: 'postId', example: '[1, 2, 3]', description: '핀 추가할 테마 Id' })
    @ApiBody({ type: CreatePinDTO })
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    async handlePin(@Req() req: any, @Query('postId') postIds: number[], @Body() pin: CreatePinDTO, @Query('regionId') regionId: string) {
        if (!postIds) postIds = [];
        postIds = postIds.map(postId => Number(postId));
        await this.postService.handlePin(req.user.userId, postIds, pin, regionId);
        this.eventEmitter.emit(MyMapEvent.POST_PIN_UPDATED, new Event(req.user.userId, postIds));
    }

    @Roles(Role.Unsigned_User)
    @UseGuards(RolesGuard)
    @Get('/pin/:regionId') 
    @ApiOkResponse({ description: '지역 내 핀 정보 모두 불러오기 성공', type: RegionPinsDTO })
    async readRegionPins(@Param('regionId') regionId: string): Promise<RegionPinsDTO> {
        return await this.postService.readRegionPins(regionId);
    }

    @Roles(Role.Signed_User)
    @UseGuards(RolesGuard)
    @Put('/:postId')
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    @ApiCreatedResponse({ description: '테마 업데이트 완료', type: Number })
    async updatePost(@Req() req: any, @Param('postId') postId:number, @Body() post:UpdatePostDTO) {
        this.logger.debug('userId : ', req.user.userId, ' postId : ', postId, ' post : ', post);
        this.eventEmitter.emit(MyMapEvent.POST_UPDATED, new Event(postId, req.user.userId));
        return await this.postService.updatePost(req.user.userId, postId, post);
    }

    @Roles(Role.Signed_User)
    @UseGuards(RolesGuard)
    @Put('/share/:postId')
    @ApiOkResponse({ description: '테마 공개 여부 변경 성공' })
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    async updatePostShare(@Req() req: any, @Param('postId') postId: number) {
        await this.postService.updatePostShare(req.user.userId, postId);
    }

    @Roles(Role.Signed_User)
    @UseGuards(RolesGuard)
    @Delete('/:postId')
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    @ApiOkResponse({ description: '테마 삭제 완료' })
    async deletePost(@Req() req: any, @Param('postId') postId: number) {
        this.logger.debug('userId : ', req.user.userId, ' postId : ', postId)
        this.eventEmitter.emit(MyMapEvent.POST_DELETED, new Event(postId, req.user.userId));
        await this.postService.deletePost(req.user.userId, postId);
    }

    @Roles(Role.Signed_User)
    @UseGuards(RolesGuard)
    @Delete('/savedPost/:postId')
    @ApiHeader({ 'name': 'Authorization', description: 'JWT token Bearer' })
    @ApiCreatedResponse({ description: '테마 저장 취소 완료' })
    async deleteSavedPost(@Req() req: any, @Param('postId') postId: number) {
        this.logger.debug('userId : ', req.user.userId, ' postId : ', postId);
        this.eventEmitter.emit(MyMapEvent.POST_UNSAVED, new Event(req.user.userId, postId));
        await this.postService.deleteSavedPost(req.user.userId, postId);
    }

    // Deprecated
    // @UseGuards(ApiKeyAuthGuard)
    // @Post('/admin/default')
    // async createDefaultPost(@Query('end') end: number) {
    //     await this.postService.createDefaultPost(end);
    // }
}
